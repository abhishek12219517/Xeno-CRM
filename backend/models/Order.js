import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled", "refunded"],
    default: "pending",
  },
  items: [
    {
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  orderDate: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for better query performance
orderSchema.index({ customerId: 1 })
orderSchema.index({ customerEmail: 1 })
orderSchema.index({ orderDate: -1 })

export default mongoose.model("Order", orderSchema)
