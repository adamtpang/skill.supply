const express = require('express');
const router = express.Router();
const { Service } = require('../models/Service');

// Get services within 100 miles of user's location
router.get('/', async (req, res) => {
  try {
    const { lat, lng } = req.query;

    let query = {};

    // If location is provided, filter by distance
    if (lat && lng) {
      query = {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: 160934 // 100 miles in meters
          }
        }
      };
    }

    const services = await Service.find(query).sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new service
router.post('/', async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    console.error('API Error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Submit a bid
router.post('/:id/bids', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    service.bids.push(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    console.error('API Error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;