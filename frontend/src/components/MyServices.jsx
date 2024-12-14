import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyServices = ({ walletAddress }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (walletAddress) {
      fetchMyServices();
    }
  }, [walletAddress]);

  const fetchMyServices = async () => {
    try {
      const response = await axios.get(`/api/services/user/${walletAddress}`);
      setServices(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load your services');
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      await axios.delete(`/api/services/${serviceId}`);
      setServices(services.filter(s => s._id !== serviceId));
    } catch (err) {
      setError('Failed to delete service');
    }
  };

  const handleEdit = async (service) => {
    // This will be implemented in the parent component
    // We'll emit an event to show the edit form
    if (typeof onEdit === 'function') {
      onEdit(service);
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Loading your services...</div>;
  if (error) return <div className="text-center py-8 text-red-400">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">My Services</h2>

      {services.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          You haven't posted any services yet
        </div>
      ) : (
        <div className="grid gap-6">
          {services.map(service => (
            <div key={service._id} className="bg-slate-800/50 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-gray-300">{service.description}</p>
                </div>
                <div className="text-xl font-bold text-purple-400">
                  {service.price} USDC
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Posted {new Date(service.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleEdit(service)}
                    className="px-4 py-2 text-sm text-purple-400 hover:text-purple-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="px-4 py-2 text-sm text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyServices;