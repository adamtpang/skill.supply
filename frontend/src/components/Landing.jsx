import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createTransferInstruction } from '@solana/spl-token';

const ServiceCard = ({ service, onHire, onConfirmCompletion, currentUserWallet }) => {
  const isProvider = currentUserWallet === service.provider.wallet;
  const isClient = currentUserWallet === service.client?.wallet;

  const renderActionButton = () => {
    if (service.status === 'open' && !isProvider) {
      return (
        <button
          onClick={() => onHire(service)}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Hire for {service.rate.amount} USDC
        </button>
      );
    }

    if (service.status === 'in_progress') {
      if ((isProvider && !service.completion.providerConfirmed) ||
          (isClient && !service.completion.clientConfirmed)) {
        return (
          <button
            onClick={() => onConfirmCompletion(service)}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Confirm Completion
          </button>
        );
      }
      return (
        <div className="text-yellow-400 text-sm">
          Waiting for {!isProvider ? 'provider' : 'client'} to confirm completion
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{service.title}</h3>
          <p className="text-gray-400 text-sm">{service.category}</p>
        </div>
        <div className="text-right">
          <div className="text-white font-bold">{service.rate.amount} USDC</div>
          <div className="text-gray-400 text-sm">
            {service.status === 'open' ? 'Available' : service.status}
          </div>
        </div>
      </div>

      <p className="text-gray-300 mb-4">{service.description}</p>

      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-white">
            {service.provider.name}
            {service.provider.rating > 0 && (
              <span className="text-yellow-400 ml-2">★ {service.provider.rating.toFixed(1)}</span>
            )}
          </div>
          <div className="text-gray-400 text-sm">
            {service.provider.completedServices} jobs completed
          </div>
        </div>
      </div>

      {renderActionButton()}
    </div>
  );
};

const NewServiceForm = ({ onSubmit, onClose }) => {
  const [loading, setLoading] = useState(false);
  const { publicKey } = useWallet();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      title: e.target.title.value,
      description: e.target.description.value,
      rate: parseFloat(e.target.rate.value),
      category: e.target.category.value,
      providerWallet: publicKey.toString(),
      providerName: e.target.providerName.value || 'Anonymous'
    };

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to create service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">Offer Your Service</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="providerName"
            placeholder="Your Name"
            className="w-full p-2 rounded bg-slate-700 text-white"
            required
          />
          <input
            name="title"
            placeholder="What service can you offer? (e.g., Web Design, Math Tutoring)"
            className="w-full p-2 rounded bg-slate-700 text-white"
            required
          />
          <select
            name="category"
            className="w-full p-2 rounded bg-slate-700 text-white"
            required
          >
            <option value="">Select Category</option>
            <option value="development">Development</option>
            <option value="design">Design</option>
            <option value="writing">Writing</option>
            <option value="teaching">Teaching</option>
            <option value="business">Business</option>
            <option value="other">Other</option>
          </select>
          <textarea
            name="description"
            placeholder="Describe what you'll deliver"
            className="w-full p-2 rounded bg-slate-700 text-white h-24"
            required
          />
          <div className="relative">
            <input
              name="rate"
              type="number"
              step="0.01"
              min="1"
              placeholder="Price in USDC"
              className="w-full p-2 rounded bg-slate-700 text-white"
              required
            />
            <span className="absolute right-3 top-2 text-gray-400">USDC</span>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              {loading ? 'Posting...' : 'Post Service'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Landing = () => {
  const { connected, publicKey, signTransaction } = useWallet();
  const [services, setServices] = useState([]);
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connected) {
      fetchServices();
    }
  }, [connected]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleHireService = async (service) => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      const connection = new Connection(process.env.REACT_APP_SOLANA_RPC_URL);
      const transaction = new Transaction();

      const transferInstruction = createTransferInstruction(
        new PublicKey(publicKey),
        new PublicKey(process.env.REACT_APP_ESCROW_WALLET),
        new PublicKey(publicKey),
        BigInt(service.rate.amount * (10 ** 6))
      );

      transaction.add(transferInstruction);
      const signedTransaction = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(signature);

      const response = await fetch(`/api/services/${service._id}/hire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientWallet: publicKey.toString(),
          transactionId: signature
        })
      });

      if (!response.ok) throw new Error('Failed to update service');
      fetchServices();
    } catch (error) {
      console.error('Error hiring service:', error);
      alert('Failed to hire service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCompletion = async (service) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/services/${service._id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: publicKey.toString()
        })
      });

      if (!response.ok) throw new Error('Failed to confirm completion');
      fetchServices();
    } catch (error) {
      console.error('Error confirming completion:', error);
      alert('Failed to confirm completion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <nav className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/50 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">skill.supply</div>
          <div className="flex gap-4 items-center">
            {connected && (
              <button
                onClick={() => setShowNewServiceForm(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                + Offer Service
              </button>
            )}
            <WalletMultiButton />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 pt-24">
        {connected ? (
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                currentUserWallet={publicKey?.toString()}
                onHire={handleHireService}
                onConfirmCompletion={handleConfirmCompletion}
              />
            ))}
            {services.length === 0 && (
              <div className="col-span-2 text-center py-12 text-gray-400">
                No services available. Be the first to offer a service!
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-white mb-6">
              Connect wallet to get started
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Offer your services or hire talented people instantly
            </p>
            <WalletMultiButton />
          </div>
        )}
      </main>

      {showNewServiceForm && (
        <NewServiceForm
          onSubmit={async (formData) => {
            const response = await fetch('/api/services', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Failed to create service');
            fetchServices();
          }}
          onClose={() => setShowNewServiceForm(false)}
        />
      )}
    </div>
  );
};

export default Landing;