import express from "express"
import Joi from "joi"
import Campaign from "../models/Campaign.js"
import Customer from "../models/Customer.js"
import CommunicationLog from "../models/CommunicationLog.js"
import { verifyToken } from "../middleware/auth.js"
import { sendCampaignMessages } from "../services/campaignService.js"

const router = express.Router()

// Updated validation schema to include audienceSize
const campaignSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().optional().trim(),
  rules: Joi.object().required(),
  message: Joi.string().required(),
  aiGenerated: Joi.boolean().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  audienceSize: Joi.number().integer().min(0).optional(), // Added this field
})

/**
 * @swagger
 * /api/campaigns/preview:
 *   post:
 *     summary: Preview audience size for campaign rules
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rules:
 *                 type: object
 *     responses:
 *       200:
 *         description: Audience size preview
 */
router.post("/preview", verifyToken, async (req, res) => {
  try {
    const { rules } = req.body

    if (!rules) {
      return res.status(400).json({ error: "Rules are required" })
    }

    // Build MongoDB query from rules
    const query = buildMongoQuery(rules)
    const audienceSize = await Customer.countDocuments(query)

    // Get sample customers for preview
    const sampleCustomers = await Customer.find(query).limit(5).select("name email totalSpending visits lastVisit")

    res.json({
      audienceSize,
      sampleCustomers,
      query: JSON.stringify(query, null, 2), // For debugging
    })
  } catch (error) {
    console.error("Preview audience error:", error)
    res.status(500).json({ error: "Failed to preview audience" })
  }
})

/**
 * @swagger
 * /api/campaigns:
 *   post:
 *     summary: Create and launch a new campaign
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               rules:
 *                 type: object
 *               message:
 *                 type: string
 *               aiGenerated:
 *                 type: boolean
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               audienceSize:
 *                 type: number
 *     responses:
 *       201:
 *         description: Campaign created and launched successfully
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { error, value } = campaignSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    // Build MongoDB query and get audience
    const query = buildMongoQuery(value.rules)
    const actualAudienceSize = await Customer.countDocuments(query)

    // Use the actual audience size from database, not from frontend
    const audienceSize = actualAudienceSize

    if (audienceSize === 0) {
      return res.status(400).json({ error: "No customers match the specified rules" })
    }

    // Create campaign with the actual audience size
    const campaign = new Campaign({
      name: value.name,
      description: value.description,
      rules: value.rules,
      message: value.message,
      audienceSize: audienceSize, // Use calculated audience size
      createdBy: req.user._id,
      status: "active",
      aiGenerated: value.aiGenerated || false,
      tags: value.tags || [],
    })

    await campaign.save()

    // Start sending messages asynchronously
    sendCampaignMessages(campaign._id, query, value.message).catch((error) =>
      console.error("Campaign sending error:", error),
    )

    res.status(201).json({
      message: "Campaign created and launched successfully",
      campaign,
    })
  } catch (error) {
    console.error("Create campaign error:", error)
    res.status(500).json({ error: "Failed to create campaign" })
  }
})

/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     summary: Get all campaigns for the user
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of campaigns
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const campaigns = await Campaign.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email")

    const total = await Campaign.countDocuments({ createdBy: req.user._id })

    res.json({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get campaigns error:", error)
    res.status(500).json({ error: "Failed to fetch campaigns" })
  }
})

/**
 * @swagger
 * /api/campaigns/{id}:
 *   get:
 *     summary: Get campaign details with communication logs
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign details
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).populate("createdBy", "name email")

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" })
    }

    // Get communication logs
    const logs = await CommunicationLog.find({ campaignId: campaign._id }).sort({ createdAt: -1 }).limit(100)

    res.json({
      campaign,
      logs,
    })
  } catch (error) {
    console.error("Get campaign error:", error)
    res.status(500).json({ error: "Failed to fetch campaign" })
  }
})

// Helper function to build MongoDB query from rules
function buildMongoQuery(rules) {
  if (!rules || typeof rules !== "object") {
    return {}
  }

  // Handle different rule structures
  if (rules.operator && rules.conditions) {
    return buildComplexQuery(rules)
  }

  // Handle simple rules
  const query = {}

  if (rules.totalSpending) {
    if (rules.totalSpending.operator === "gt") {
      query.totalSpending = { $gt: rules.totalSpending.value }
    } else if (rules.totalSpending.operator === "lt") {
      query.totalSpending = { $lt: rules.totalSpending.value }
    } else if (rules.totalSpending.operator === "eq") {
      query.totalSpending = rules.totalSpending.value
    }
  }

  if (rules.visits) {
    if (rules.visits.operator === "gt") {
      query.visits = { $gt: rules.visits.value }
    } else if (rules.visits.operator === "lt") {
      query.visits = { $lt: rules.visits.value }
    } else if (rules.visits.operator === "eq") {
      query.visits = rules.visits.value
    }
  }

  if (rules.lastVisit) {
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - rules.lastVisit.value)

    if (rules.lastVisit.operator === "before") {
      query.lastVisit = { $lt: daysAgo }
    } else if (rules.lastVisit.operator === "after") {
      query.lastVisit = { $gt: daysAgo }
    }
  }

  return query
}

function buildComplexQuery(rules) {
  const { operator, conditions } = rules

  if (operator === "AND") {
    const andConditions = conditions.map((condition) => buildMongoQuery(condition))
    return { $and: andConditions }
  } else if (operator === "OR") {
    const orConditions = conditions.map((condition) => buildMongoQuery(condition))
    return { $or: orConditions }
  }

  return {}
}

export default router
