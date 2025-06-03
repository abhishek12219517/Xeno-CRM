import Customer from "../models/Customer.js"
import CommunicationLog from "../models/CommunicationLog.js"
import Campaign from "../models/Campaign.js"
import { sendToVendorAPI } from "./vendorService.js"

/**
 * Send campaign messages to all customers matching the query
 * @param {string} campaignId - Campaign ID
 * @param {object} query - MongoDB query to find customers
 * @param {string} messageTemplate - Message template with {name} placeholder
 */
export async function sendCampaignMessages(campaignId, query, messageTemplate) {
  try {
    console.log(`Starting campaign ${campaignId} message delivery...`)

    // Get all customers matching the query
    const customers = await Customer.find(query)

    if (customers.length === 0) {
      console.log("No customers found for campaign")
      return
    }

    console.log(`Found ${customers.length} customers for campaign`)

    // Create communication log entries for all customers
    const logEntries = customers.map((customer) => ({
      campaignId,
      customerId: customer._id,
      customerEmail: customer.email,
      customerName: customer.name,
      message: messageTemplate.replace("{name}", customer.name),
      status: "pending",
    }))

    const logs = await CommunicationLog.insertMany(logEntries)
    console.log(`Created ${logs.length} communication log entries`)

    // Send messages in batches to avoid overwhelming the vendor API
    const batchSize = 10
    for (let i = 0; i < logs.length; i += batchSize) {
      const batch = logs.slice(i, i + batchSize)

      // Process batch with delay
      await Promise.all(batch.map((log) => sendSingleMessage(log)))

      // Add delay between batches
      if (i + batchSize < logs.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    console.log(`Campaign ${campaignId} message delivery completed`)
  } catch (error) {
    console.error("Campaign message sending error:", error)

    // Update campaign status to failed
    await Campaign.findByIdAndUpdate(campaignId, {
      status: "failed",
      completedAt: new Date(),
    })
  }
}

/**
 * Send a single message through the vendor API
 * @param {object} log - Communication log entry
 */
async function sendSingleMessage(log) {
  try {
    // Send to vendor API
    const response = await sendToVendorAPI({
      messageId: log._id.toString(),
      customerEmail: log.customerEmail,
      customerName: log.customerName,
      message: log.message,
    })

    // Update log based on vendor response
    if (response.success) {
      await CommunicationLog.findByIdAndUpdate(log._id, {
        status: "sent",
        sentAt: new Date(),
        vendorResponse: response,
      })
    } else {
      await CommunicationLog.findByIdAndUpdate(log._id, {
        status: "failed",
        failureReason: response.error || "Vendor API error",
        vendorResponse: response,
      })
    }
  } catch (error) {
    console.error(`Failed to send message ${log._id}:`, error)

    // Mark as failed
    await CommunicationLog.findByIdAndUpdate(log._id, {
      status: "failed",
      failureReason: error.message,
      vendorResponse: { error: error.message },
    })
  }
}
