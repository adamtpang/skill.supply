import React from 'react';

const TermsOfService = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Terms of Service</h2>

        <div className="space-y-4 text-gray-300">
          <section>
            <h3 className="text-xl font-bold text-white mb-2">1. Platform Fees</h3>
            <p>skill.supply charges a 5% platform fee on all successful transactions. This fee is automatically deducted from the payment amount.</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-2">2. Payment Terms</h3>
            <p>All payments are processed in USDC on the Solana blockchain. Funds are held in escrow until both parties confirm service completion.</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-2">3. Service Completion</h3>
            <p>Both provider and client must confirm service completion before funds are released from escrow.</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-2">4. Dispute Resolution</h3>
            <p>In case of disputes, contact support with transaction details. Decisions are final and binding.</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-2">5. User Conduct</h3>
            <p>Users must provide accurate information and conduct transactions in good faith. Fraudulent behavior will result in account termination.</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-2">6. Service Quality</h3>
            <p>Providers must deliver services as described. Clients must provide clear requirements and respond to communications promptly.</p>
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

export default TermsOfService;