import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../utils/api';

const ServiceModal = ({ service, onClose, currentUserWallet }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [jobStatus, setJobStatus] = useState(service.status || 'pending');
  const [userRating, setUserRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const messagesEndRef = useRef(null);

  const isProvider = currentUserWallet === service.walletAddress;
  const selectedBid = service.bids?.find(bid => bid.selected);
  const isHired = selectedBid?.bidderWallet === currentUserWallet;
  const canMessage = isProvider || isHired;
  const canRate = jobStatus === 'completed' && !service.ratings?.find(r => r.raterWallet === currentUserWallet);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!canMessage) return;

      try {
        const response = await fetch(`${API_URL}/api/services/${service._id}/messages`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setMessages(data);
        scrollToBottom();
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [service._id, canMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !canMessage) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/services/${service._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderWallet: currentUserWallet,
          content: newMessage.trim()
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      setNewMessage('');
      const data = await response.json();
      setMessages([...messages, data]);
      scrollToBottom();
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteJob = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/services/${service._id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });

      if (!response.ok) throw new Error('Failed to complete job');
      setJobStatus('completed');
      setShowRating(true);
    } catch (err) {
      setError('Failed to complete job');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!userRating) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/services/${service._id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raterWallet: currentUserWallet,
          rating: userRating
        })
      });

      if (!response.ok) throw new Error('Failed to submit rating');
      setShowRating(false);
    } catch (err) {
      setError('Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
      <div className="bg-slate-800 p-6 rounded-lg w-full max-w-2xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{service.title}</h3>
            <div className="text-emerald-400 text-sm">${service.price} USDC</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {canMessage ? (
          <>
            <div className="flex-grow overflow-y-auto mb-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.senderWallet === currentUserWallet ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.senderWallet === currentUserWallet
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-gray-100'
                    }`}
                  >
                    <div className="text-sm">{msg.content}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow p-3 rounded bg-slate-700 text-white"
              />
              <button
                type="submit"
                disabled={loading || !newMessage.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                Send
              </button>
            </form>

            {jobStatus === 'pending' && (isProvider || isHired) && (
              <button
                onClick={handleCompleteJob}
                className="w-full mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                Mark as Complete
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Messages will appear here once connected
          </div>
        )}

        {showRating && (
          <div className="mt-4 p-4 bg-slate-700 rounded">
            <div className="text-white mb-2">Rate your experience:</div>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  className={`text-2xl ${
                    star <= userRating ? 'text-yellow-400' : 'text-gray-500'
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmitRating}
              disabled={!userRating || loading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              Submit Rating
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-400 text-sm">{error}</div>
        )}
      </div>
    </div>
  );
};

export default ServiceModal;