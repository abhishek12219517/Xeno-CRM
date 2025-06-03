import mongoose from "mongoose"

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  totalSpending: {
    type: Number,
    default: 0,
    min: 0,
  },
  visits: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastVisit: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
})

// Index for better query performance
customerSchema.index({ lastVisit: -1 })

export default mongoose.model("Customer", customerSchema)
