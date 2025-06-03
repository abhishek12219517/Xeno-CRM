import axios from "axios"

/**
 * Dummy vendor API service that simulates message delivery
 * In a real application, this would integrate with actual email/SMS providers
 * @param {object} messageData - Message data to send
 * @returns {object} Response from vendor API
 */
export async function sendToVendorAPI(messageData) {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

    // Simulate 90% success rate, 10% failure rate as specified
    const isSuccess = Math.random() < 0.9

    if (isSuccess) {
      // Simulate successful delivery
      const response = {
        success: true,
        messageId: messageData.messageId,
        vendorMessageId: `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: "sent",
        timestamp: new Date().toISOString(),
      }

      // Simulate delivery receipt callback after a delay
      setTimeout(
        () => {
          sendDeliveryReceipt(messageData.messageId, "delivered")
        },
        Math.random() * 5000 + 2000,
      ) // 2-7 seconds delay

      return response
    } else {
      // Simulate failure
      const failureReasons = [
        "Invalid email address",
        "Customer opted out",
        "Rate limit exceeded",
        "Temporary service unavailable",
        "Message content blocked",
      ]

      return {
        success: false,
        messageId: messageData.messageId,
        error: failureReasons[Math.floor(Math.random() * failureReasons.length)],
        status: "failed",
        timestamp: new Date().toISOString(),
      }
    }
  } catch (error) {
    console.error("Vendor API error:", error)
    return {
      success: false,
      messageId: messageData.messageId,
      error: "Vendor API unavailable",
      status: "failed",
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Send delivery receipt back to our API
 * This simulates the vendor calling our delivery receipt endpoint
 * @param {string} messageId - Message ID
 * @param {string} status - Delivery status
 */
async function sendDeliveryReceipt(messageId, status) {
  try {
    const receiptData = {
      messageId,
      status,
      timestamp: new Date().toISOString(),
    }

    // Call our own delivery receipt API
    const apiUrl = process.env.API_URL || "http://localhost:5000"
    await axios.post(`${apiUrl}/api/delivery/receipt`, receiptData)

    console.log(`Delivery receipt sent for message ${messageId}: ${status}`)
  } catch (error) {
    console.error("Failed to send delivery receipt:", error)
  }
}
