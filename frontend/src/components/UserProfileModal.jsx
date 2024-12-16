import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../utils/api';

const UserProfileModal = ({ walletAddress, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const modalRef = useRef();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/${walletAddress}`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError('Could not load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [walletAddress]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const renderStars = (rating) => {
    return '⭐'.repeat(Math.round(rating));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div ref={modalRef} className="bg-slate-800 p-6 rounded-lg w-full max-w-md">
        {loading ? (
          <div className="text-center text-gray-400">Loading profile...</div>
        ) : error ? (
          <div className="text-center text-red-400">{error}</div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {walletAddress.slice(0, 8)}...
                </h3>
                <div className="text-purple-400">
                  {renderStars(profile.averageRating)} ({profile.ratings.length} reviews)
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div className="text-gray-400 mb-2">Completed Jobs</div>
              <div className="text-2xl font-bold text-white">
                {profile.completedJobs}
              </div>
            </div>

            {profile.ratings.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-4">Recent Reviews</h4>
                <div className="space-y-4">
                  {profile.ratings.map((review, index) => (
                    <div key={index} className="bg-slate-700/50 p-4 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-purple-400">
                          {renderStars(review.rating)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{review.review}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;