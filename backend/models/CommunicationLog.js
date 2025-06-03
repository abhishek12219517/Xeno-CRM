import mongoose from "mongoose"

const communicationLogSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "sent", "failed", "delivered"],
    default: "pending",
  },
  sentAt: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
  failureReason: {
    type: String,
  },
  vendorResponse: {
    type: mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for better query performance
communicationLogSchema.index({ campaignId: 1 })
communicationLogSchema.index({ customerId: 1 })
communicationLogSchema.index({ status: 1 })
communicationLogSchema.index({ createdAt: -1 })

export default mongoose.model("CommunicationLog", communicationLogSchema)
