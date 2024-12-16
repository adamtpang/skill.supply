import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, PublicKey } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { API_URL } from '../utils/api';
import UserProfileModal from './UserProfileModal';

const NewServiceForm = ({ onSubmit, onClose, isNeed = false, setShowLanding }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { publicKey } = useWallet();
  const modalRef = useRef();
  const [userLocation, setUserLocation] = useState(null);

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

  // Handle click outside
  const handleClickOutside = useCallback((e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userLocation) {
      setError('Location access is required to post services.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = {
      title: e.target.title.value,
      description: e.target.description.value,
      price: parseFloat(e.target.price.value),
      location: {
        type: 'Point',
        coordinates: [userLocation.lng, userLocation.lat]
      },
      walletAddress: publicKey.toString(),
      type: isNeed ? 'need' : 'service'
    };

    try {
      const response = await fetch(`${API_URL}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Server response:', {
          status: response.status,
          statusText: response.statusText,
          body: text
        });

        let errorMessage;
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || 'Failed to create service';
        } catch (e) {
          errorMessage = 'Server error. Our team has been notified.';
        }

        throw new Error(errorMessage);
      }

      await onSubmit();
      setShowLanding(false);
      onClose();
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to post. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div ref={modalRef} className="bg-slate-800 p-6 rounded-lg w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">
          {isNeed ? '🔍 Post a Need' : '🚀 Share Your Skills'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            placeholder={isNeed ? "What do you need help with?" : "What skill can you offer?"}
            className="w-full p-3 rounded bg-slate-700 text-white"
            required
          />

          <textarea
            name="description"
            placeholder={isNeed ? "Describe what you need..." : "Describe your expertise..."}
            className="w-full p-3 rounded bg-slate-700 text-white h-24"
            required
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
            />
            <span className="absolute right-3 top-3 text-gray-400">USDC</span>
          </div>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading || !userLocation}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? '⏳ Posting...' : '✨ Post'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-slate-700 text-white rounded hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ServiceCard = ({ service, onHire, currentUserWallet }) => {
  const isProvider = currentUserWallet === service.walletAddress;
  const isNeed = service.type === 'need';
  const [showBidForm, setShowBidForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [bidMessage, setBidMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate total amount with 1% fee
  const baseAmount = service.price || 0;
  const feeAmount = baseAmount * 0.01;
  const totalAmount = baseAmount + feeAmount;

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/services/${service._id}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidderWallet: currentUserWallet,
          message: bidMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit bid');
      }

      setShowBidForm(false);
      setBidMessage('');
    } catch (err) {
      setError('Failed to submit bid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderBidForm = () => (
    <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
      <h4 className="text-white font-medium mb-2">Submit Your Offer</h4>
      <form onSubmit={handleSubmitBid}>
        <textarea
          value={bidMessage}
          onChange={(e) => setBidMessage(e.target.value)}
          placeholder="Describe why you're the best fit for this task..."
          className="w-full p-3 rounded bg-slate-600 text-white mb-3"
          required
        />
        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Offer'}
          </button>
          <button
            type="button"
            onClick={() => setShowBidForm(false)}
            className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  const renderBids = () => {
    if (!service.bids?.length) return null;

    return (
      <div className="mt-4">
        <h4 className="text-white font-medium mb-2">Offers ({service.bids.length})</h4>
        <div className="space-y-2">
          {service.bids.map((bid) => (
            <div key={bid._id} className="p-3 bg-slate-700/50 rounded">
              <div className="flex justify-between items-start">
                <button
                  onClick={() => setShowProfile(bid.bidderWallet)}
                  className="text-purple-400 hover:text-purple-300"
                >
                  {bid.bidderWallet.slice(0, 8)}...
                </button>
                {isProvider && bid.status === 'pending' && (
                  <button
                    onClick={() => onHire(service, bid)}
                    className="text-sm bg-purple-600 px-3 py-1 rounded hover:bg-purple-700"
                  >
                    Accept Offer
                  </button>
                )}
              </div>
              <p className="text-gray-300 text-sm mt-1">{bid.message}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderActionButton = () => {
    if (isProvider) {
      return (
        <div className="text-sm text-gray-400">
          This is your {isNeed ? 'need' : 'skill'}
        </div>
      );
    }

    if (isNeed) {
      return (
        <button
          onClick={() => setShowBidForm(true)}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Offer Your Skills
        </button>
      );
    }

    return (
      <button
        onClick={() => onHire(service)}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
      >
        Hire Now • {totalAmount.toFixed(2)} USDC
      </button>
    );
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-xs font-medium text-purple-400 mb-1">
            {isNeed ? 'NEED' : 'SKILL'}
          </div>
          <h3 className="text-xl font-bold text-white">{service.title}</h3>
        </div>
        <div className="text-right">
          <div className="text-white font-bold">{baseAmount.toFixed(2)} USDC</div>
        </div>
      </div>

      <p className="text-gray-300 mb-4">{service.description}</p>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-400">
          Posted by{' '}
          <button
            onClick={() => setShowProfile(service.walletAddress)}
            className="text-purple-400 hover:text-purple-300"
          >
            {service.walletAddress.slice(0, 8)}...
          </button>
        </div>
      </div>

      {renderActionButton()}
      {showBidForm && renderBidForm()}
      {renderBids()}

      {showProfile && (
        <UserProfileModal
          walletAddress={showProfile}
          onClose={() => setShowProfile(null)}
        />
      )}
    </div>
  );
};

const Navigation = ({ connected, showLanding, setShowLanding, usdcBalance, setShowNewServiceForm, setShowNewNeedForm }) => (
  <nav className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm z-50">
    <div className="container mx-auto px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setShowLanding(true)}
            className="text-2xl font-bold text-white hover:text-purple-400 transition-colors"
          >
            skill.supply
          </button>
          {connected && (
            <div className="hidden md:flex gap-6">
              <button
                onClick={() => setShowLanding(false)}
                className={`text-sm transition-colors ${!showLanding ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}
              >
                Marketplace
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          {connected && (
            <>
              <div className="hidden md:flex items-center gap-6">
                <div className="text-white bg-slate-800/50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <span className="font-medium">{usdcBalance?.toFixed(2) || '0.00'}</span>
                  <span className="text-sm text-gray-400">USDC</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowNewServiceForm(true)}
                    className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    + Share Skills
                  </button>
                  <button
                    onClick={() => setShowNewNeedForm(true)}
                    className="px-4 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    + Post Need
                  </button>
                </div>
              </div>
            </>
          )}
          <WalletMultiButton />
        </div>
      </div>
    </div>
  </nav>
);

const HeroSection = () => (
  <div className="text-center py-16">
    <div className="flex items-center justify-center gap-2 mb-4">
      <h2 className="text-2xl font-medium text-purple-400">skill.supply</h2>
      <span className="text-2xl">⚡️</span>
    </div>

    <h1 className="text-5xl font-bold text-white mb-6">
      instant jobs
    </h1>

    <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
      <div className="bg-slate-800/50 p-4 rounded-xl flex items-center gap-3">
        <div className="text-2xl">1️⃣</div>
        <div className="text-left">
          <div className="font-medium text-white">Install Phantom</div>
          <div className="text-sm text-gray-400">Your secure wallet</div>
        </div>
      </div>
      <div className="bg-slate-800/50 p-4 rounded-xl flex items-center gap-3">
        <div className="text-2xl">2️⃣</div>
        <div className="text-left">
          <div className="font-medium text-white">Post or Hire</div>
          <div className="text-sm text-gray-400">Find instant work</div>
        </div>
      </div>
      <div className="bg-slate-800/50 p-4 rounded-xl flex items-center gap-3">
        <div className="text-2xl">3️⃣</div>
        <div className="text-left">
          <div className="font-medium text-white">Get Paid</div>
          <div className="text-sm text-gray-400">Instant USDC</div>
        </div>
      </div>
    </div>

    <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
      <div className="bg-slate-800/50 p-6 rounded-xl w-full">
        <h3 className="text-lg font-medium text-white mb-3">Why Phantom Wallet?</h3>
        <ul className="text-left space-y-3 text-gray-300 mb-6">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">✓</span>
            <span>Secure payments with instant settlement</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">✓</span>
            <span>No bank account or credit card needed</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">✓</span>
            <span>Works worldwide with low transaction fees</span>
          </li>
        </ul>
        <div className="flex flex-col items-center gap-4">
          <WalletMultiButton />
          <a
            href="https://phantom.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Don't have Phantom? Install here ↗️
          </a>
        </div>
      </div>
    </div>
  </div>
);

const Landing = () => {
  const { connection } = useConnection();
  const { connected, publicKey, signTransaction } = useWallet();
  const [services, setServices] = useState([]);
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);
  const [showNewNeedForm, setShowNewNeedForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Get user's location when component mounts
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
          setUserLocation(null);
        }
      );
    } else {
      setUserLocation(null);
    }
  }, []);

  const fetchUsdcBalance = useCallback(async () => {
    try {
      const userUsdcAccount = await getAssociatedTokenAddress(
        new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
        publicKey
      );

      try {
        const balance = await connection.getTokenAccountBalance(userUsdcAccount);
        setUsdcBalance(balance.value.uiAmount);
      } catch (e) {
        setUsdcBalance(0);
      }
    } catch (error) {
      console.error('Error fetching USDC balance:', error);
      setUsdcBalance(0);
    }
  }, [connection, publicKey]);

  const fetchServices = useCallback(async () => {
    const maxRetries = 3;

    for (let i = 0; i < maxRetries; i++) {
      try {
        setLoading(true);
        setError(null);

        if (!userLocation) {
          setError('Please enable location access to see nearby services.');
          setLoading(false);
          return;
        }

        // Add location parameters to the API call
        const locationParams = `?lat=${userLocation.lat}&lng=${userLocation.lng}`;
        const response = await fetch(`${API_URL}/api/services${locationParams}`);

        if (!response.ok) {
          const text = await response.text();
          console.error('Server response:', {
            status: response.status,
            statusText: response.statusText,
            body: text,
            attempt: i + 1
          });

          let errorMessage;
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.message || errorData.error || 'Failed to fetch services';
          } catch (e) {
            errorMessage = 'Server error. Our team has been notified.';
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();
        setServices(data);
        break; // Success, exit the retry loop
      } catch (error) {
        console.error(`Error fetching services (attempt ${i + 1}):`, error);

        if (i === maxRetries - 1) {
          setError(error.message || 'Failed to fetch services. Please try again later.');
        } else {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 5000)));
        }
      }
    }

    setLoading(false);
  }, [userLocation]); // Add userLocation to dependencies

  useEffect(() => {
    const init = async () => {
      if (connected && publicKey) {
        try {
          await fetchUsdcBalance();
          await fetchServices();
        } catch (err) {
          console.error('Error initializing:', err);
          setError('Failed to initialize. Please try again.');
        }
      }
    };
    init();
  }, [connected, publicKey, fetchUsdcBalance, fetchServices]);

  const handleHireService = async (service) => {
    if (!connected || !publicKey || !signTransaction) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userUsdcAccount = await getAssociatedTokenAddress(
        new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), // USDC mint
        publicKey
      );

      const escrowUsdcAccount = await getAssociatedTokenAddress(
        new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
        new PublicKey(process.env.REACT_APP_ESCROW_WALLET)
      );

      const revenueUsdcAccount = await getAssociatedTokenAddress(
        new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
        new PublicKey(process.env.REACT_APP_REVENUE_WALLET)
      );

      // Calculate amounts
      const baseAmount = service.price;
      const feeAmount = baseAmount * 0.01; // 1% fee
      const escrowAmount = baseAmount;

      // Create transaction with two instructions
      const transaction = new Transaction();

      // 1. Transfer fee to revenue wallet
      const feeInstruction = createTransferInstruction(
        userUsdcAccount,
        revenueUsdcAccount,
        publicKey,
        BigInt(Math.floor(feeAmount * 1e6))
      );

      // 2. Transfer main amount to escrow
      const escrowInstruction = createTransferInstruction(
        userUsdcAccount,
        escrowUsdcAccount,
        publicKey,
        BigInt(Math.floor(escrowAmount * 1e6))
      );

      transaction.add(feeInstruction, escrowInstruction);
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signedTransaction = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      await Promise.all([
        fetchServices(),
        fetchUsdcBalance()
      ]);
      alert('Transaction successful!');
    } catch (error) {
      console.error('Error processing transaction:', error);
      setError(error.message || 'Failed to process transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navigation
        connected={connected}
        showLanding={showLanding}
        setShowLanding={setShowLanding}
        usdcBalance={usdcBalance}
        setShowNewServiceForm={setShowNewServiceForm}
        setShowNewNeedForm={setShowNewNeedForm}
      />

      <main className="container mx-auto px-6 py-8 pt-24">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded text-red-300">
            {error}
          </div>
        )}
        {(!connected || showLanding) ? (
          <HeroSection />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-2 text-center py-12 text-gray-400">
                Loading...
              </div>
            ) : services.length > 0 ? (
              services.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  currentUserWallet={publicKey?.toString()}
                  onHire={handleHireService}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-gray-400">
                No services found nearby. Be the first to post!
              </div>
            )}
          </div>
        )}
      </main>

      {showNewServiceForm && (
        <NewServiceForm
          onSubmit={fetchServices}
          onClose={() => setShowNewServiceForm(false)}
          isNeed={false}
          setShowLanding={setShowLanding}
        />
      )}

      {showNewNeedForm && (
        <NewServiceForm
          onSubmit={fetchServices}
          onClose={() => setShowNewNeedForm(false)}
          isNeed={true}
          setShowLanding={setShowLanding}
        />
      )}
    </div>
  );
};

export default Landing;