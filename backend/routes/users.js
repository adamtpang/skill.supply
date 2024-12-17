const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Service = require('../models/Service');

// Get user profile and services
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Get or create user profile
    let user = await User.findOne({ walletAddress });
    if (!user) {
      user = await User.create({
        walletAddress,
        displayName: walletAddress.slice(0, 8) + '...',
        avgRating: 0,
        numRatings: 0,
        completedJobs: 0
      });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Get user's services and needs
router.get('/services/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const services = await Service.find({ walletAddress });
    res.json(services);
  } catch (err) {
    console.error('Error fetching user services:', err);
    res.status(500).json({ error: 'Failed to fetch user services' });
  }
});

// Update user profile
router.put('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { displayName } = req.body;

    const user = await User.findOneAndUpdate(
      { walletAddress },
      { displayName },
      { new: true, upsert: true }
    );

    res.json(user);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

module.exports = router;