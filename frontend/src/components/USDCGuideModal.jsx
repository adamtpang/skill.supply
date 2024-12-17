import React from 'react';

const USDCGuideModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
      <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">Get USDC</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <div className="font-medium text-white mb-2">What is USDC?</div>
            <div className="text-gray-300 text-sm">
              USDC is a digital dollar (stablecoin). 1 USDC = 1 USD.
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <div className="font-medium text-white mb-2">1. Install Phantom</div>
              <div className="text-gray-300 text-sm">
                Get the Phantom wallet extension from <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">phantom.app</a>
              </div>
            </div>

            <div className="p-4 bg-slate-700/50 rounded-lg">
              <div className="font-medium text-white mb-2">2. Buy USDC</div>
              <div className="text-gray-300 text-sm space-y-2">
                <div>Open Phantom and click "Buy"</div>
                <div>Select USDC as the token</div>
                <div>Purchase using credit card or bank transfer</div>
              </div>
            </div>

            <div className="p-4 bg-slate-700/50 rounded-lg">
              <div className="font-medium text-white mb-2">3. Start Using</div>
              <div className="text-gray-300 text-sm">
                Once you have USDC in your wallet, you can instantly hire talent or get hired
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default USDCGuideModal;