import React, { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, PublicKey } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { API_URL } from '../utils/api';
import Navigation from './Navigation';
import HeroSection from './HeroSection';
import ServiceCard from './ServiceCard';
import NewServiceForm from './NewServiceForm';
import UserProfileModal from './UserProfileModal';
import USDCGuideModal from './USDCGuideModal';

/* eslint-disable no-undef */  // Allow BigInt global

const EmptyState = ({ activeTab, setShowNewServiceForm, setShowNewNeedForm }) => (
  <div className="col-span-2 text-center py-12">
    <div className="text-gray-400 mb-6">No {activeTab === 'skills' ? 'skills' : 'needs'} found nearby.</div>
    <div className="flex justify-center gap-4">
      {activeTab === 'skills' ? (
        <button
          onClick={() => setShowNewServiceForm(true)}
          className="px-4 py-2 bg-amber-600/20 text-amber-400 text-sm rounded-lg hover:bg-amber-600/30 transition-colors"
        >
          + Share Skill
        </button>
      ) : (
        <button
          onClick={() => setShowNewNeedForm(true)}
          className="px-4 py-2 bg-purple-600/20 text-purple-400 text-sm rounded-lg hover:bg-purple-600/30 transition-colors"
        >
          + Post Need
        </button>
      )}
    </div>
  </div>
);

const MarketplaceHeader = ({ activeTab, setActiveTab, setShowNewServiceForm, setShowNewNeedForm, services, sortBy, setSortBy }) => {
  const skillsCount = services.filter(s => s.type === 'service').length;
  const needsCount = services.filter(s => s.type === 'need').length;

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
      <div className="flex flex-col md:flex-row md:items-center gap-4 flex-grow">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg transition-colors ${
              activeTab === 'skills' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Skills
            <span className="ml-2 px-2 py-0.5 bg-slate-800/50 rounded text-sm">
              {skillsCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('needs')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg transition-colors ${
              activeTab === 'needs' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Needs
            <span className="ml-2 px-2 py-0.5 bg-slate-800/50 rounded text-sm">
              {needsCount}
            </span>
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-28 px-2 py-2 bg-slate-800 text-gray-300 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price-high">Highest $</option>
            <option value="price-low">Lowest $</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShowNewServiceForm(true)}
          className="flex-1 md:flex-none h-10 px-4 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700 transition-colors"
        >
          Post Skill
        </button>
        <button
          onClick={() => setShowNewNeedForm(true)}
          className="flex-1 md:flex-none h-10 px-4 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition-colors"
        >
          Post Need
        </button>
      </div>
    </div>
  );
};

const Landing = () => {
  const { connection } = useConnection();
  const { connected, publicKey, signTransaction } = useWallet();
  const [services, setServices] = useState([]);
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLanding, setShowLanding] = useState(!connected);
  const [showProfile, setShowProfile] = useState(false);
  const [showUSDCGuide, setShowUSDCGuide] = useState(false);
  const [showNewNeedForm, setShowNewNeedForm] = useState(false);
  const [activeTab, setActiveTab] = useState('skills');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    setShowLanding(!connected);
  }, [connected]);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/services`);

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
          errorMessage = errorData.message || errorData.error || 'Failed to fetch services';
        } catch (e) {
          errorMessage = 'Server error. Our team has been notified.';
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError(error.message || 'Failed to fetch services. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (connected) {
      fetchServices();
    }
  }, [connected, fetchServices]);

  const handleHireService = async (service) => {
    if (!connected || !publicKey || !signTransaction) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const usdcMint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint: usdcMint }
      );

      if (tokenAccounts.value.length === 0) {
        setError('No USDC account found. Please add USDC to your wallet first.');
        setShowUSDCGuide(true);
        setLoading(false);
        return;
      }

      const userUsdcAccount = tokenAccounts.value[0].pubkey;
      const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount;
      const totalNeeded = service.price * 1.01; // Price + 1% fee

      if (balance.uiAmount < totalNeeded) {
        setError(`Insufficient USDC balance. You need ${totalNeeded.toFixed(2)} USDC for this service.`);
        setShowUSDCGuide(true);
        setLoading(false);
        return;
      }

      const escrowUsdcAccount = await getAssociatedTokenAddress(
        usdcMint,
        new PublicKey(process.env.REACT_APP_ESCROW_WALLET)
      );

      const totalAmount = service.price * 1.01; // Base amount + 1% fee
      const transaction = new Transaction();
      const instruction = createTransferInstruction(
        userUsdcAccount,
        escrowUsdcAccount,
        publicKey,
        BigInt(Math.floor(totalAmount * 1e6))
      );

      transaction.add(instruction);
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signedTransaction = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      await fetchServices();
      alert('Transaction successful!');
    } catch (error) {
      console.error('Error processing transaction:', error);
      if (error.message.includes('insufficient funds')) {
        setError('Insufficient USDC balance. Please add more USDC to your wallet.');
      } else {
        setError('Failed to process transaction. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getSortedServices = useCallback(() => {
    const filteredServices = services.filter(service =>
      activeTab === 'skills' ? service.type === 'service' : service.type === 'need'
    );

    switch (sortBy) {
      case 'oldest':
        return [...filteredServices].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'price-high':
        return [...filteredServices].sort((a, b) => b.price - a.price);
      case 'price-low':
        return [...filteredServices].sort((a, b) => a.price - b.price);
      case 'newest':
      default:
        return [...filteredServices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [services, activeTab, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navigation
        connected={connected}
        showLanding={showLanding}
        setShowLanding={setShowLanding}
      />

      <main className="container mx-auto max-w-7xl px-6 py-8 pt-24">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded text-red-300">
            {error}
          </div>
        )}
        {(!connected || showLanding) ? (
          <HeroSection />
        ) : (
          <>
            <MarketplaceHeader
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setShowNewServiceForm={setShowNewServiceForm}
              setShowNewNeedForm={setShowNewNeedForm}
              services={services}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {loading ? (
                <div className="col-span-full text-center py-12 text-gray-400">
                  Loading...
                </div>
              ) : services.length > 0 ? (
                getSortedServices().map((service) => (
                  <ServiceCard
                    key={service._id}
                    service={service}
                    currentUserWallet={publicKey?.toString()}
                    setShowUSDCGuide={setShowUSDCGuide}
                    onHire={handleHireService}
                  />
                ))
              ) : (
                <EmptyState
                  activeTab={activeTab}
                  setShowNewServiceForm={setShowNewServiceForm}
                  setShowNewNeedForm={setShowNewNeedForm}
                />
              )}
            </div>
          </>
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

      {showProfile && (
        <UserProfileModal
          walletAddress={publicKey?.toString()}
          onClose={() => setShowProfile(false)}
        />
      )}

      {showUSDCGuide && (
        <USDCGuideModal onClose={() => setShowUSDCGuide(false)} />
      )}
    </div>
  );
};

export default Landing;