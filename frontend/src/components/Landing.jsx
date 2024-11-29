import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Landing = () => {
  const { connected } = useWallet();
  const [activeTab, setActiveTab] = useState('offers');
  const [showAbout, setShowAbout] = useState(true);
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);

  useEffect(() => {
    if (connected) {
      setShowAbout(false);
    }
  }, [connected]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/50 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">skill.supply</div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowAbout(true)}
              className={`px-4 py-2 text-white transition-colors ${
                showAbout ? 'text-purple-300' : 'hover:text-purple-300'
              }`}
            >
              About
            </button>
            {connected && (
              <button
                onClick={() => setShowAbout(false)}
                className={`px-4 py-2 text-white transition-colors ${
                  !showAbout ? 'text-purple-300' : 'hover:text-purple-300'
                }`}
              >
                Market
              </button>
            )}
            <WalletMultiButton className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors" />
          </div>
        </div>
      </nav>

      <div className="pt-20">
        {(!connected || showAbout) ? (
          <>
            {/* Hero Section */}
            <section className="container mx-auto px-6 py-20 text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Your Skills.<br />Your Market.
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                The first decentralized marketplace for services. Connect, trade skills, and get paid instantly with Solana.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {!connected ? (
                  <WalletMultiButton className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors" />
                ) : (
                  <button
                    onClick={() => setShowAbout(false)}
                    className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors animate-pulse"
                  >
                    Enter Marketplace →
                  </button>
                )}
                <button className="px-8 py-3 border-2 border-purple-600 text-white rounded-lg hover:bg-purple-600/20 transition-colors">
                  Learn More
                </button>
              </div>
              {connected && (
                <div className="mt-6 text-purple-400 animate-bounce">
                  Your wallet is connected! Check out the marketplace now.
                </div>
              )}
            </section>

            {/* Features Grid */}
            <section className="container mx-auto px-6 py-20">
              <div className="grid md:grid-cols-3 gap-8">
                <FeatureCard
                  icon="🎯"
                  title="Offer Services"
                  description={
                    connected ?
                    "Head to the Market tab and start offering your services now!" :
                    "Connect your wallet and list your skills. Set your own rates and availability."
                  }
                />
                <FeatureCard
                  icon="🔍"
                  title="Request Services"
                  description={
                    connected ?
                    "Visit the Market tab to post your service requests!" :
                    "Connect your wallet to post your needs and find skilled professionals."
                  }
                />
                <FeatureCard
                  icon="💸"
                  title="Instant Payments"
                  description="Get paid instantly in USDC via Solana. No more waiting for bank transfers or payment processing."
                />
              </div>
            </section>

            {/* How It Works */}
            <section className="container mx-auto px-6 py-20">
              <h2 className="text-3xl font-bold text-white text-center mb-12">
                How It Works
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StepCard
                  number="1"
                  title="Connect Wallet"
                  description="Sign in securely with your Phantom wallet"
                />
                <StepCard
                  number="2"
                  title="Create Profile"
                  description="List your services or post your requirements"
                />
                <StepCard
                  number="3"
                  title="Match"
                  description="Connect with the perfect service provider or client"
                />
                <StepCard
                  number="4"
                  title="Trade"
                  description="Exchange services with instant USDC payments"
                />
              </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-6 py-20">
              <div className="bg-purple-600/20 rounded-2xl p-12 text-center">
                <h2 className="text-3xl font-bold text-white mb-6">
                  Ready to Join the Skill Economy?
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  {connected
                    ? "Your wallet is connected! Jump into the marketplace and start trading skills."
                    : "Start trading skills and earning USDC today. No middlemen, no delays, just pure value exchange."
                  }
                </p>
                {!connected ? (
                  <WalletMultiButton className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors" />
                ) : (
                  <button
                    onClick={() => setShowAbout(false)}
                    className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors group"
                  >
                    Enter Marketplace
                    <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </button>
                )}
              </div>
            </section>
          </>
        ) : (
          // Dashboard View (shown when wallet is connected and not showing about)
          <main className="container mx-auto px-6 py-8">
            {/* Tabs */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setActiveTab('offers')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'offers'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Service Offers
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'requests'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Service Requests
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Add New Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => activeTab === 'offers' ? setShowNewServiceForm(true) : setShowNewRequestForm(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  + New {activeTab === 'offers' ? 'Service' : 'Request'}
                </button>
              </div>

              {/* New Service Form Modal */}
              {showNewServiceForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md">
                    <h3 className="text-xl font-bold text-white mb-4">Offer New Service</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const newService = {
                        id: Date.now(),
                        title: formData.get('title'),
                        description: formData.get('description'),
                        rate: formData.get('rate'),
                        provider: connected ? window.solana.publicKey.toString() : 'Unknown'
                      };
                      setServices(prev => [...prev, newService]);
                      setShowNewServiceForm(false);
                    }}>
                      <div className="space-y-4">
                        <input
                          name="title"
                          placeholder="Service Title"
                          className="w-full p-2 rounded bg-slate-700 text-white"
                          required
                        />
                        <textarea
                          name="description"
                          placeholder="Service Description"
                          className="w-full p-2 rounded bg-slate-700 text-white h-24"
                          required
                        />
                        <input
                          name="rate"
                          placeholder="Rate (USDC)"
                          className="w-full p-2 rounded bg-slate-700 text-white"
                          required
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            Post Service
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowNewServiceForm(false)}
                            className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* New Request Form Modal */}
              {showNewRequestForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md">
                    <h3 className="text-xl font-bold text-white mb-4">Post New Request</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const newRequest = {
                        id: Date.now(),
                        title: formData.get('title'),
                        description: formData.get('description'),
                        budget: formData.get('budget'),
                        requester: connected ? window.solana.publicKey.toString() : 'Unknown'
                      };
                      setRequests(prev => [...prev, newRequest]);
                      setShowNewRequestForm(false);
                    }}>
                      <div className="space-y-4">
                        <input
                          name="title"
                          placeholder="Request Title"
                          className="w-full p-2 rounded bg-slate-700 text-white"
                          required
                        />
                        <textarea
                          name="description"
                          placeholder="Request Description"
                          className="w-full p-2 rounded bg-slate-700 text-white h-24"
                          required
                        />
                        <input
                          name="budget"
                          placeholder="Budget (USDC)"
                          className="w-full p-2 rounded bg-slate-700 text-white"
                          required
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            Post Request
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowNewRequestForm(false)}
                            className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Listings Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'offers' ? (
                  services.length > 0 ? (
                    services.map((service) => (
                      <ServiceCard
                        key={service.id}
                        title={service.title}
                        description={service.description}
                        rate={`${service.rate} USDC`}
                        provider={service.provider}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 text-gray-400">
                      No services offered yet. Be the first to offer a service!
                    </div>
                  )
                ) : (
                  requests.length > 0 ? (
                    requests.map((request) => (
                      <RequestCard
                        key={request.id}
                        title={request.title}
                        description={request.description}
                        budget={`${request.budget} USDC`}
                        requester={request.requester}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 text-gray-400">
                      No service requests yet. Be the first to post a request!
                    </div>
                  )
                )}
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-gray-800">
        <div className="flex justify-between items-center">
          <div className="text-gray-400">© 2024 skill.supply</div>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white">Terms</a>
            <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-slate-800/50 p-8 rounded-xl">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }) => (
  <div className="bg-slate-800/50 p-8 rounded-xl relative">
    <div className="absolute -top-4 -left-4 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
      {number}
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const ServiceCard = ({ title, description, rate, provider }) => (
  <div className="bg-slate-800/50 p-8 rounded-xl">
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400">{description}</p>
    <div className="mt-4">
      <span className="text-gray-400">Rate: </span>
      <span className="text-white">{rate}</span>
    </div>
    <div className="mt-2">
      <span className="text-gray-400">Provider: </span>
      <span className="text-white">{provider}</span>
    </div>
  </div>
);

const RequestCard = ({ title, description, budget, requester }) => (
  <div className="bg-slate-800/50 p-8 rounded-xl">
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400">{description}</p>
    <div className="mt-4">
      <span className="text-gray-400">Budget: </span>
      <span className="text-white">{budget}</span>
    </div>
    <div className="mt-2">
      <span className="text-gray-400">Requester: </span>
      <span className="text-white">{requester}</span>
    </div>
  </div>
);

export default Landing;