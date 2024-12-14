const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const upload = require('../utils/imageUpload');

// Get problems with optional location-based filtering
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius = 10000 } = req.query; // radius in meters, default 10km

    let query = {};

    // Add location-based search if coordinates are provided
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    const problems = await Problem.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new problem with image upload support
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const problemData = {
      ...req.body,
      location: {
        type: 'Point',
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
        address: req.body.address
      }
    };

    // Add uploaded images if any
    if (req.files && req.files.length > 0) {
      problemData.images = req.files.map(file => ({
        url: file.location,
        caption: ''
      }));
    }

    const problem = new Problem(problemData);
    const newProblem = await problem.save();
    res.status(201).json(newProblem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update problem with new images
router.patch('/:id', upload.array('images', 5), async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Update basic fields
    if (req.body.title) problem.title = req.body.title;
    if (req.body.description) problem.description = req.body.description;

    // Update location if provided
    if (req.body.latitude && req.body.longitude) {
      problem.location = {
        type: 'Point',
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
        address: req.body.address || problem.location.address
      };
    }

    // Add new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: file.location,
        caption: ''
      }));
      problem.images = [...(problem.images || []), ...newImages];
    }

    const updatedProblem = await problem.save();
    res.json(updatedProblem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update vote
router.patch('/:id/vote', async (req, res) => {
  try {
    const { direction, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Initialize userVotes if needed
    if (!problem.userVotes) {
      problem.userVotes = new Map();
    }

    const currentVote = problem.userVotes.get(userId);

    // Handle vote changes
    if (currentVote === direction) {
      // Remove vote if clicking same direction
      problem.userVotes.delete(userId);
    } else if (currentVote && direction !== currentVote) {
      // If changing vote direction, remove the vote instead of changing it
      problem.userVotes.delete(userId);
    } else {
      // Add new vote
      problem.userVotes.set(userId, direction);
    }

    // Calculate total votes
    let total = 0;
    problem.userVotes.forEach((vote) => {
      total += vote === 'up' ? 1 : -1;
    });

    // Update total votes
    problem.totalVotes = total;
    await problem.save({ validateBeforeSave: false });

    res.json({
      ...problem.toObject(),
      userVote: problem.userVotes.get(userId) || null
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete problem
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Check if user is the author
    if (problem.author.uid !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this problem' });
    }

    await Problem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Problem deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add this route to get a single problem
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;