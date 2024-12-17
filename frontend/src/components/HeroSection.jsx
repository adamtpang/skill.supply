import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const HeroSection = () => {
  const { connected } = useWallet();

  return (
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
          <h3 className="text-lg font-medium text-white mb-4 flex items-center justify-center gap-2">
            <span className="text-2xl">👻</span>
            <span>Why Phantom Wallet?</span>
          </h3>
          <ul className="text-left space-y-4 text-gray-300 mb-6">
            <li className="flex items-start gap-3">
              <span className="text-purple-400 text-lg">✓</span>
              <span className="text-white">Secure payments with instant settlement</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 text-lg">✓</span>
              <span className="text-white">No bank account or credit card needed</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 text-lg">✓</span>
              <span className="text-white">Works worldwide with low transaction fees</span>
            </li>
          </ul>
          {!connected && (
            <div className="flex flex-col items-center gap-4">
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-lg font-medium"
              >
                <span className="text-xl">👻</span> Install Phantom
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;