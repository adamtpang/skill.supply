const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  bidderWallet: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const userProfileSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  ratings: [{
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: String,
    fromWallet: String,
    jobId: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  }
});

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
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
  walletAddress: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['service', 'need'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed'],
    default: 'open'
  },
  bids: [bidSchema],
  acceptedBid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add text indexes for search
serviceSchema.index({ title: 'text', description: 'text' });
// Add geospatial index for location queries
serviceSchema.index({ location: '2dsphere' });

const Service = mongoose.model('Service', serviceSchema);
const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = { Service, UserProfile };