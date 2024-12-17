import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { API_URL } from '../utils/api';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey, Connection } from '@solana/web3.js';

const NewServiceForm = ({ onSubmit, onClose, isNeed = false, initialData = null }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [stakeAmount, setStakeAmount] = useState(initialData?.stakedAmount || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { publicKey, signTransaction } = useWallet();
  const modalRef = useRef();
  const [userLocation, setUserLocation] = useState(null);
  const connection = new Connection(API_URL);

  useEffect(() => {
    // Get user's location when form opens
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Please enable location access to post services.');
        }
      );
    } else {
      setError('Location access is required to post services.');
    }
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isNeed && stakeAmount > 0) {
        const userUsdcAccount = await getAssociatedTokenAddress(
          new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
          publicKey
        );

        const balance = await connection.getTokenAccountBalance(userUsdcAccount);
        if (!balance.value || balance.value.uiAmount < stakeAmount) {
          setError(`Insufficient USDC balance for staking. You have ${balance.value?.uiAmount || 0} USDC`);
          return;
        }
      }

      const endpoint = initialData
        ? `${API_URL}/api/services/${initialData._id}`
        : `${API_URL}/api/services`;

      const response = await fetch(endpoint, {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price),
          type: isNeed ? 'need' : 'service',
          walletAddress: publicKey.toString(),
          stakedAmount: isNeed ? parseFloat(stakeAmount || 0) : 0
        })
      });

      if (!response.ok) throw new Error('Failed to save');
      onSubmit();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]" onClick={handleOverlayClick}>
      <style>
        {`
          /* Remove spinners from number inputs */
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
        `}
      </style>
      <div className="bg-slate-800 p-6 rounded-lg w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">
            {initialData ? 'Edit' : 'New'} {isNeed ? 'Need' : 'Skill'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            placeholder={isNeed ? "What do you need help with?" : "What skill can you offer?"}
            className="w-full p-3 rounded bg-slate-700 text-white"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            name="description"
            placeholder={isNeed ? "Describe what you need..." : "Describe your expertise..."}
            className="w-full p-3 rounded bg-slate-700 text-white h-24"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="relative">
            <input
              name="price"
              type="number"
              step="0.01"
              min="1"
              placeholder={isNeed ? "Your budget in USDC" : "Your rate in USDC"}
              className="w-full p-3 rounded bg-slate-700 text-white pr-16"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <span className="absolute right-3 top-3 text-gray-400">USDC</span>
          </div>

          {isNeed && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Stake Amount (USDC)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Optional: Stake USDC to show commitment"
                  className="w-full p-3 rounded bg-slate-700 text-white"
                  min="0"
                  step="0.01"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  USDC
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-1">
                Staking funds shows you're serious about this need
              </p>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Post')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewServiceForm;