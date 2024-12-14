import React from 'react';

const PrivacyPolicy = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Privacy Policy</h2>

        <div className="space-y-4 text-gray-300">
          <section>
            <h3 className="text-xl font-bold text-white mb-2">1. Information We Collect</h3>
            <p>We collect wallet addresses, service details, and transaction history. Personal information like names is optional.</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-2">2. How We Use Information</h3>
            <p>Information is used to facilitate transactions, maintain service quality, and improve user experience.</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-2">3. Blockchain Transparency</h3>
            <p>All transactions are recorded on the Solana blockchain and are publicly visible. Only connect wallets you're comfortable using for public transactions.</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-2">4. Data Security</h3>
            <p>We implement security measures to protect your information but cannot guarantee absolute security of blockchain transactions.</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-2">5. Third-Party Services</h3>
            <p>We use Solana blockchain and USDC for transactions. Their respective privacy policies apply to those interactions.</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-2">6. Contact Information</h3>
            <p>For privacy concerns, contact us through our support channels.</p>
          </section>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;