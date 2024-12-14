const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  rate: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      enum: ['USDC'],
      default: 'USDC'
    }
  },
  category: {
    type: String,
    required: true,
    enum: [
      'development',
      'design',
      'writing',
      'teaching',
      'business',
      'other'
    ]
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed'],
    default: 'open'
  },
  provider: {
    wallet: {
      type: String,
      required: true
    },
    name: String,
    completedServices: {
      type: Number,
      default: 0
    }
  },
  client: {
    wallet: String,
    name: String
  },
  escrow: {
    status: {
      type: String,
      enum: ['not_funded', 'funded', 'released'],
      default: 'not_funded'
    },
    transactionId: String,
    fundedAt: Date,
    releasedAt: Date
  },
  completion: {
    providerConfirmed: {
      type: Boolean,
      default: false
    },
    clientConfirmed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for searching
serviceSchema.index({ title: 'text', description: 'text', category: 1, status: 1 });
serviceSchema.index({ 'provider.wallet': 1, 'client.wallet': 1 });

module.exports = mongoose.model('Service', serviceSchema);