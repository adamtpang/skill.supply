import React, { useState } from 'react';
import { API_URL } from '../utils/api';

const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y';

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo';

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd';

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h';

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm';

  return Math.floor(seconds) + 's';
};

const ServiceCard = ({ service, currentUserWallet, setShowUSDCGuide, onHire }) => {
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const isProvider = currentUserWallet === service.walletAddress;
  const isNeed = service.type === 'need';
  const timeAgo = getTimeAgo(service.createdAt);

  const handleHireClick = async () => {
    onHire(service);
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service._id,
          fromWallet: currentUserWallet,
          toWallet: service.walletAddress,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setMessage('');
      setShowMessageForm(false);
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`${
      isProvider
        ? 'bg-slate-700/50'
        : isNeed
          ? 'bg-purple-900/40 hover:bg-purple-900/50'
          : 'bg-amber-900/40 hover:bg-amber-900/50'
    } rounded-xl p-3 flex flex-col transition-colors`}>
      <div className="flex-grow">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div>
            <div className="text-xs font-medium mb-1 flex items-center gap-2">
              <span className={isNeed ? 'text-purple-400' : 'text-amber-400'}>
                {isNeed ? 'NEED' : 'SKILL'}{!isProvider && ` - ${service.walletAddress.slice(0, 8)}...`}
              </span>
              <span className="text-gray-500">· {timeAgo}</span>
            </div>
            <div className={`${isNeed ? 'text-purple-400' : 'text-amber-400'} font-medium mb-1.5`}>
              ${service.price}
            </div>
            <h3 className="text-base font-medium text-white">{service.title}</h3>
          </div>
        </div>
        <p className="text-gray-300 text-sm mb-3">{service.description}</p>
      </div>

      {!isProvider && (
        <div className="space-y-2">
          {isNeed ? (
            <button
              onClick={() => setShowMessageForm(true)}
              className="w-full px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              Offer Your Skills
            </button>
          ) : (
            <button
              onClick={handleHireClick}
              className="w-full px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors text-sm font-medium"
            >
              Hire Now
            </button>
          )}
        </div>
      )}

      {showMessageForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowMessageForm(false)}>
          <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Send Message</h3>
              <button onClick={() => setShowMessageForm(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleMessageSubmit}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your skills and experience..."
                className="w-full p-3 rounded bg-slate-700 text-white mb-4 min-h-[120px]"
                required
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCard;