const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { Connection, PublicKey } = require('@solana/web3.js');

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find()
      .sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new service
router.post('/', async (req, res) => {
  try {
    const service = new Service({
      title: req.body.title,
      description: req.body.description,
      rate: {
        amount: parseFloat(req.body.rate),
        currency: 'USDC'
      },
      provider: {
        wallet: req.body.providerWallet,
        name: req.body.providerName,
        rating: 0,
        completedServices: 0,
        totalEarned: 0
      },
      category: req.body.category,
      location: req.body.location
    });

    const newService = await service.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Hire a service
router.post('/:id/hire', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.status !== 'open') {
      return res.status(400).json({ message: 'Service is not available' });
    }

    // Verify the transaction
    const connection = new Connection(process.env.SOLANA_RPC_URL);
    const transaction = await connection.getTransaction(req.body.transactionId);

    if (!transaction) {
      return res.status(400).json({ message: 'Invalid transaction' });
    }

    // Update service status
    service.status = 'in_progress';
    service.client = {
      wallet: req.body.clientWallet,
      name: req.body.clientName || 'Anonymous',
      rating: 0
    };
    service.escrow = {
      status: 'funded',
      transactionId: req.body.transactionId,
      fundedAt: new Date()
    };

    const updatedService = await service.save();
    res.json(updatedService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Confirm service completion
router.post('/:id/complete', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.status !== 'in_progress') {
      return res.status(400).json({ message: 'Service is not in progress' });
    }

    const isProvider = req.body.wallet === service.provider.wallet;
    const isClient = req.body.wallet === service.client.wallet;

    if (!isProvider && !isClient) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update completion status
    if (isProvider) {
      service.completion.providerConfirmed = true;
    } else {
      service.completion.clientConfirmed = true;
    }

    // If both parties confirmed, complete the service and release funds
    if (service.completion.providerConfirmed && service.completion.clientConfirmed) {
      service.status = 'completed';
      service.completion.completedAt = new Date();
      service.escrow.status = 'released';
      service.escrow.releasedAt = new Date();

      // Update provider stats
      service.provider.completedServices += 1;
      service.provider.totalEarned += service.rate.amount;
    }

    const updatedService = await service.save();
    res.json(updatedService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rate a service
router.post('/:id/rate', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.status !== 'completed') {
      return res.status(400).json({ message: 'Service is not completed' });
    }

    const isProvider = req.body.wallet === service.provider.wallet;
    const isClient = req.body.wallet === service.client.wallet;

    if (!isProvider && !isClient) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Add rating
    const rating = {
      score: req.body.rating,
      review: req.body.review,
      timestamp: new Date()
    };

    if (isProvider) {
      service.completion.rating.fromProvider = rating;
      // Update client rating
      const clientServices = await Service.find({
        'client.wallet': service.client.wallet,
        status: 'completed',
        'completion.rating.fromProvider': { $exists: true }
      });

      const totalRating = clientServices.reduce((sum, s) =>
        sum + s.completion.rating.fromProvider.score, 0
      );
      service.client.rating = totalRating / (clientServices.length + 1);
    } else {
      service.completion.rating.fromClient = rating;
      // Update provider rating
      const providerServices = await Service.find({
        'provider.wallet': service.provider.wallet,
        status: 'completed',
        'completion.rating.fromClient': { $exists: true }
      });

      const totalRating = providerServices.reduce((sum, s) =>
        sum + s.completion.rating.fromClient.score, 0
      );
      service.provider.rating = totalRating / (providerServices.length + 1);
    }

    const updatedService = await service.save();
    res.json(updatedService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's services (as provider or client)
router.get('/user/:wallet', async (req, res) => {
  try {
    const services = await Service.find({
      $or: [
        { 'provider.wallet': req.params.wallet },
        { 'client.wallet': req.params.wallet }
      ]
    }).sort({ createdAt: -1 });

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search services
router.get('/search', async (req, res) => {
  try {
    const { query, category, status } = req.query;
    const searchQuery = {};

    if (query) {
      searchQuery.$text = { $search: query };
    }

    if (category) {
      searchQuery.category = category;
    }

    if (status) {
      searchQuery.status = status;
    }

    const services = await Service.find(searchQuery)
      .sort({ createdAt: -1 });

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;