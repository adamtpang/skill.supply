import React, { useState } from 'react';
import { ServiceCard } from './ServiceCard';

const Marketplace = ({ services, onNewService, onNewRequest }) => {
  const [activeTab, setActiveTab] = useState('hire'); // 'hire' or 'work'

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('hire')}
          className={`px-6 py-3 rounded-lg transition-colors ${
            activeTab === 'hire'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Hire Talent
        </button>
        <button
          onClick={() => setActiveTab('work')}
          className={`px-6 py-3 rounded-lg transition-colors ${
            activeTab === 'work'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Offer Skills
        </button>
      </div>

      {/* Action Button */}
      <div className="flex justify-end mb-8">
        <button
          onClick={() => activeTab === 'work' ? onNewService() : onNewRequest()}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {activeTab === 'work' ? '+ Offer Service' : '+ Post Request'}
        </button>
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {services.length > 0 ? (
          services
            .filter(service =>
              activeTab === 'work'
                ? service.type === 'service'
                : service.type === 'request'
            )
            .map(service => (
              <ServiceCard
                key={service._id}
                service={service}
              />
            ))
        ) : (
          <div className="col-span-2 text-center py-12 text-gray-400">
            {activeTab === 'work'
              ? 'No services offered yet. Be the first to offer your skills!'
              : 'No service requests yet. Post your first request!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;