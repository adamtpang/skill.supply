const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// Get services with location
router.get('/', async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Location parameters required' });
    }

    const services = await Service.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: 50000 // 50km radius
        }
      }
    }).sort('-createdAt');

    res.json(services);
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Create service
router.post('/', async (req, res) => {
  try {
    const { title, description, price, type, walletAddress, location, stakedAmount } = req.body;

    const service = await Service.create({
      title,
      description,
      price,
      type,
      walletAddress,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      },
      stakedAmount: stakedAmount || 0
    });

    res.status(201).json(service);
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Submit bid
router.post('/:serviceId/bids', async (req, res) => {
  try {
    const { bidderWallet, message } = req.body;
    const service = await Service.findById(req.params.serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Check if user already has a bid
    const existingBid = service.bids.find(bid => bid.bidderWallet === bidderWallet);
    if (existingBid) {
      return res.status(400).json({ error: 'You already have a bid on this service' });
    }

    service.bids.push({ bidderWallet, message });
    await service.save();

    res.status(201).json(service);
  } catch (err) {
    console.error('Error submitting bid:', err);
    res.status(500).json({ error: 'Failed to submit bid' });
  }
});

// Update bid
router.put('/:serviceId/bids/:bidId', async (req, res) => {
  try {
    const { message } = req.body;
    const service = await Service.findById(req.params.serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const bid = service.bids.id(req.params.bidId);
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    bid.message = message;
    await service.save();

    res.json(service);
  } catch (err) {
    console.error('Error updating bid:', err);
    res.status(500).json({ error: 'Failed to update bid' });
  }
});

// Delete bid
router.delete('/:serviceId/bids/:bidId', async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    service.bids.pull(req.params.bidId);
    await service.save();

    res.json(service);
  } catch (err) {
    console.error('Error deleting bid:', err);
    res.status(500).json({ error: 'Failed to delete bid' });
  }
});

// Send message
router.post('/:serviceId/messages', async (req, res) => {
  try {
    const { senderWallet, content } = req.body;
    const service = await Service.findById(req.params.serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    service.messages.push({ senderWallet, content });
    await service.save();

    res.status(201).json(service.messages[service.messages.length - 1]);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get messages
router.get('/:serviceId/messages', async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service.messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Complete service
router.post('/:serviceId/complete', async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    service.status = 'completed';
    await service.save();

    res.json(service);
  } catch (err) {
    console.error('Error completing service:', err);
    res.status(500).json({ error: 'Failed to complete service' });
  }
});

// Rate service
router.post('/:serviceId/rate', async (req, res) => {
  try {
    const { raterWallet, rating, review } = req.body;
    const service = await Service.findById(req.params.serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    service.ratings.push({ raterWallet, rating, review });
    await service.save();

    res.json(service);
  } catch (err) {
    console.error('Error rating service:', err);
    res.status(500).json({ error: 'Failed to rate service' });
  }
});

module.exports = router;