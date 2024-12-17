import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Navigation = ({ connected, showLanding, setShowLanding }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur z-50 border-b border-slate-800">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => connected && setShowLanding(!showLanding)}
        >
          <span className="text-xl font-medium text-purple-400">skill.supply</span>
          <span className="text-xl">⚡️</span>
        </div>

        <div className="flex items-center gap-4">
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;