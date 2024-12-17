import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../utils/api';

const UserProfileModal = ({ walletAddress, onClose }) => {
  const modalRef = useRef();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, servicesRes] = await Promise.all([
          fetch(`${API_URL}/api/users/${walletAddress}`),
          fetch(`${API_URL}/api/services/user/${walletAddress}`)
        ]);

        if (!profileRes.ok) throw new Error('Failed to fetch profile');
        if (!servicesRes.ok) throw new Error('Failed to fetch services');

        const profileData = await profileRes.json();
        const servicesData = await servicesRes.json();

        setProfile({
          ...profileData,
          skills: servicesData.filter(s => s.type === 'service'),
          needs: servicesData.filter(s => s.type === 'need')
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Could not load profile');
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      fetchProfile();
    }
  }, [walletAddress]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/${walletAddress}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName })
      });

      if (!response.ok) throw new Error('Failed to update profile');
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Could not update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
      <div ref={modalRef} className="bg-slate-800 p-6 rounded-lg w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        {loading ? (
          <div className="text-center text-gray-400">Loading profile...</div>
        ) : error ? (
          <div className="text-center text-red-400">{error}</div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                {isEditing ? (
                  <form onSubmit={handleSave} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-slate-700 text-white px-3 py-1 rounded"
                      placeholder="Enter display name"
                      required
                    />
                    <button
                      type="submit"
                      className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="text-sm bg-slate-700 text-white px-3 py-1 rounded hover:bg-slate-600"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">
                      {profile.displayName || walletAddress.slice(0, 8) + '...'}
                    </h3>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-gray-400 hover:text-white"
                      title="Edit display name"
                    >
                      ✏️
                    </button>
                  </div>
                )}
                <div className="text-gray-400 mt-1">
                  {walletAddress}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 mb-2">Track Record</div>
                  <div className="text-2xl font-bold text-white">
                    {profile.completedJobs || 0} jobs completed
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 mb-2">Rating</div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl text-yellow-400">
                      {'⭐'.repeat(Math.round(profile.avgRating || 3))}
                    </div>
                    <div className="text-gray-400">
                      ({profile.numRatings || 0} reviews)
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 mb-2">Skills</div>
                  {profile?.skills?.length > 0 ? (
                    <div className="space-y-2">
                      {profile.skills.map((skill) => (
                        <div key={skill._id} className="bg-slate-700/50 p-2 rounded">
                          <div className="flex justify-between items-start">
                            <div className="font-medium text-white">{skill.title}</div>
                            <div className="text-emerald-400 text-sm">${skill.price}</div>
                          </div>
                          {skill.avgRating > 0 && (
                            <div className="text-yellow-400 text-xs mt-1">
                              {'⭐'.repeat(Math.round(skill.avgRating))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">No skills posted yet</div>
                  )}
                </div>

                <div>
                  <div className="text-gray-400 mb-2">Needs</div>
                  {profile?.needs?.length > 0 ? (
                    <div className="space-y-2">
                      {profile.needs.map((need) => (
                        <div key={need._id} className="bg-slate-700/50 p-2 rounded">
                          <div className="flex justify-between items-start">
                            <div className="font-medium text-white">{need.title}</div>
                            <div className="text-emerald-400 text-sm">${need.price}</div>
                          </div>
                          {need.stakedAmount > 0 && (
                            <div className="text-purple-400 text-xs mt-1">
                              ${need.stakedAmount} staked
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">No needs posted yet</div>
                  )}
                </div>
              </div>

              {profile.reviews && profile.reviews.length > 0 && (
                <div>
                  <div className="text-gray-400 mb-2">Recent Reviews</div>
                  <div className="space-y-3">
                    {profile.reviews.map((review, index) => (
                      <div key={index} className="bg-slate-700/50 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div className="text-white font-medium">
                            {review.fromWallet.slice(0, 8)}...
                          </div>
                          <div className="text-yellow-400">
                            {'⭐'.repeat(Math.max(0, review.rating))}
                          </div>
                        </div>
                        {review.review && (
                          <p className="text-gray-300 text-sm mt-1">{review.review}</p>
                        )}
                        <div className="text-gray-400 text-xs mt-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;