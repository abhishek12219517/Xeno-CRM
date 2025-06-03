import express from "express"
import Joi from "joi"
import Order from "../models/Order.js"
import Customer from "../models/Customer.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

// Validation schemas
const orderSchema = Joi.object({
  customerEmail: Joi.string().email().required(),
  amount: Joi.number().positive().required(),
  status: Joi.string().valid("pending", "completed", "cancelled", "refunded").optional(),
  items: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().positive().required(),
        price: Joi.number().positive().required(),
      }),
    )
    .optional(),
  orderDate: Joi.date().optional(),
})

const bulkOrderSchema = Joi.array().items(orderSchema).max(1000)

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerEmail:
 *                 type: string
 *               amount:
 *                 type: number
 *               status:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Order created successfully
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { error, value } = orderSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    // Find customer by email
    const customer = await Customer.findOne({ email: value.customerEmail })
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" })
    }

    // Create order
    const order = new Order({
      ...value,
      customerId: customer._id,
    })
    await order.save()

    // Update customer stats if order is completed
    if (value.status === "completed" || !value.status) {
      await Customer.findByIdAndUpdate(customer._id, {
        $inc: {
          totalSpending: value.amount,
          visits: 1,
        },
        $set: { lastVisit: new Date() },
      })
    }

    res.status(201).json({
      message: "Order created successfully",
      order,
    })
  } catch (error) {
    console.error("Create order error:", error)
    res.status(500).json({ error: "Failed to create order" })
  }
})

/**
 * @swagger
 * /api/orders/bulk:
 *   post:
 *     summary: Create multiple orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 customerEmail:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 status:
 *                   type: string
 *                 items:
 *                   type: array
 *     responses:
 *       201:
 *         description: Orders created successfully
 */
router.post("/bulk", verifyToken, async (req, res) => {
  try {
    const { error, value } = bulkOrderSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const orders = []
    const customerUpdates = new Map()

    // Process each order
    for (const orderData of value) {
      const customer = await Customer.findOne({ email: orderData.customerEmail })
      if (customer) {
        const order = {
          ...orderData,
          customerId: customer._id,
        }
        orders.push(order)

        // Track customer updates
        if (orderData.status === "completed" || !orderData.status) {
          const existing = customerUpdates.get(customer._id.toString()) || { spending: 0, visits: 0 }
          customerUpdates.set(customer._id.toString(), {
            spending: existing.spending + orderData.amount,
            visits: existing.visits + 1,
          })
        }
      }
    }

    // Insert orders
    const createdOrders = await Order.insertMany(orders, { ordered: false })

    // Update customer stats
    for (const [customerId, updates] of customerUpdates) {
      await Customer.findByIdAndUpdate(customerId, {
        $inc: {
          totalSpending: updates.spending,
          visits: updates.visits,
        },
        $set: { lastVisit: new Date() },
      })
    }

    res.status(201).json({
      message: `${createdOrders.length} orders created successfully`,
      orders: createdOrders,
    })
  } catch (error) {
    console.error("Bulk create orders error:", error)
    res.status(500).json({ error: "Failed to create orders" })
  }
})

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders with pagination
 *     tags: [Orders]
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
 *       - in: query
 *         name: customerEmail
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const customerEmail = req.query.customerEmail
    const skip = (page - 1) * limit

    const query = {}
    if (customerEmail) {
      query.customerEmail = customerEmail
    }

    const orders = await Order.find(query)
      .populate("customerId", "name email")
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Order.countDocuments(query)

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get orders error:", error)
    res.status(500).json({ error: "Failed to fetch orders" })
  }
})

export default router
