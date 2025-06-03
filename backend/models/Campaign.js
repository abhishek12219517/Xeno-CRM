import mongoose from "mongoose"

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  rules: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  audienceSize: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["draft", "active", "completed", "failed"],
    default: "draft",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  stats: {
    sent: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
  },
  aiGenerated: {
    type: Boolean,
    default: false,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
})

// Index for better query performance
campaignSchema.index({ createdBy: 1 })
campaignSchema.index({ createdAt: -1 })
campaignSchema.index({ status: 1 })

export default mongoose.model("Campaign", campaignSchema)
