// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/skillsupply', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Service Schema
const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['service', 'need'],
    required: true
  },
  walletAddress: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Service = mongoose.model('Service', serviceSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Service'
  },
  fromWallet: {
    type: String,
    required: true
  },
  toWallet: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

const Message = mongoose.model('Message', messageSchema);

// Services API
app.post('/api/services', async (req, res) => {
  try {
    const { title, description, price, type, walletAddress } = req.body;

    if (!title || !description || !price || !type || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const service = new Service({
      title,
      description,
      price,
      type,
      walletAddress
    });

    await service.save();
    res.status(201).json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find().sort('-createdAt');
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Messages API
app.post('/api/messages', async (req, res) => {
  try {
    const { serviceId, fromWallet, toWallet, message } = req.body;

    if (!serviceId || !fromWallet || !toWallet || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newMessage = new Message({
      serviceId,
      fromWallet,
      toWallet,
      message
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// Get messages for a user
app.get('/api/messages/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const messages = await Message.find({
      $or: [
        { fromWallet: walletAddress },
        { toWallet: walletAddress }
      ]
    })
    .sort('-createdAt')
    .populate('serviceId');

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Mark message as read
app.patch('/api/messages/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
