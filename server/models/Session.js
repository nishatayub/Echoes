const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const conversationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true
  },
  isUser: {
    type: Boolean,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const sessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  personName: { 
    type: String, 
    required: true,
    trim: true
  },
  relationshipType: {
    type: String,
    enum: ['family', 'friend', 'partner', 'pet', 'mentor', 'other'],
    default: 'other'
  },
  memories: [memorySchema],
  conversations: [conversationSchema],
  finalLetter: {
    type: String,
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
sessionSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('Session', sessionSchema);
