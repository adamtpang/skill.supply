const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// Create a new service
router.post('/', async (req, res) => {
  try {
    const service = new Service({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get services by user wallet address
router.get('/user/:walletAddress', async (req, res) => {
  try {
    const services = await Service.find({
      walletAddress: req.params.walletAddress
    }).sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific service
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a service
router.put('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Verify the wallet address matches
    if (service.walletAddress !== req.body.walletAddress) {
      return res.status(403).json({ error: 'Not authorized to update this service' });
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json(updatedService);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a service
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Verify the wallet address matches (from query param)
    if (service.walletAddress !== req.query.walletAddress) {
      return res.status(403).json({ error: 'Not authorized to delete this service' });
    }

    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;