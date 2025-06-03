import express from "express"
import CommunicationLog from "../models/CommunicationLog.js"
import Campaign from "../models/Campaign.js"

const router = express.Router()

/**
 * @swagger
 * /api/delivery/receipt:
 *   post:
 *     summary: Receive delivery receipt from vendor
 *     tags: [Delivery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [sent, failed, delivered]
 *               timestamp:
 *                 type: string
 *               failureReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Receipt processed successfully
 */
router.post("/receipt", async (req, res) => {
  try {
    const { messageId, status, timestamp, failureReason } = req.body

    if (!messageId || !status) {
      return res.status(400).json({ error: "messageId and status are required" })
    }

    // Find the communication log entry
    const log = await CommunicationLog.findById(messageId)
    if (!log) {
      return res.status(404).json({ error: "Message not found" })
    }

    // Update the log entry
    const updateData = {
      status,
      vendorResponse: req.body,
    }

    if (status === "sent") {
      updateData.sentAt = new Date(timestamp || Date.now())
    } else if (status === "delivered") {
      updateData.deliveredAt = new Date(timestamp || Date.now())
    } else if (status === "failed") {
      updateData.failureReason = failureReason
    }

    await CommunicationLog.findByIdAndUpdate(messageId, updateData)

    // Update campaign stats
    await updateCampaignStats(log.campaignId)

    res.json({ message: "Receipt processed successfully" })
  } catch (error) {
    console.error("Delivery receipt error:", error)
    res.status(500).json({ error: "Failed to process delivery receipt" })
  }
})

// Helper function to update campaign statistics
async function updateCampaignStats(campaignId) {
  try {
    const stats = await CommunicationLog.aggregate([
      { $match: { campaignId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const statsObj = { sent: 0, failed: 0, delivered: 0 }
    stats.forEach((stat) => {
      if (stat._id in statsObj) {
        statsObj[stat._id] = stat.count
      }
    })

    // Check if campaign is completed
    const totalLogs = await CommunicationLog.countDocuments({ campaignId })
    const processedLogs = statsObj.sent + statsObj.failed + statsObj.delivered

    const updateData = { stats: statsObj }
    if (processedLogs >= totalLogs) {
      updateData.status = "completed"
      updateData.completedAt = new Date()
    }

    await Campaign.findByIdAndUpdate(campaignId, updateData)
  } catch (error) {
    console.error("Update campaign stats error:", error)
  }
}

export default router
