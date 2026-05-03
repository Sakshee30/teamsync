const mongoose = require('mongoose');

// Think of it like a workspace where team members work together
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true  // project must have a name
  },
  description: {
    type: String,
    default: ''     // description is optional
  },
  status: {
    type: String,
    enum: ['active', 'on_hold', 'completed'],  // only these values allowed
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  // Who created this project
  owner: {
    type: mongoose.Schema.Types.ObjectId,  // this is a reference to User
    ref: 'User',
    required: true
  },
  // List of team members in this project
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,  
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    }
  }],
  dueDate: {
    type: Date,
    default: null
  },
  // Color to identify project visually
  color: {
    type: String,
    default: '#4F46E5'  
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);