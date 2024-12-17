const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderWallet: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const bidSchema = new mongoose.Schema({
  bidderWallet: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ratingSchema = new mongoose.Schema({
  raterWallet: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const serviceSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true
  },
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
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  stakedAmount: {
    type: Number,
    default: 0
  },
  bids: [bidSchema],
  messages: [messageSchema],
  ratings: [ratingSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index
serviceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Service', serviceSchema);