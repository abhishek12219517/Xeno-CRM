import express from "express"
import Joi from "joi"
import Customer from "../models/Customer.js"
import Order from "../models/Order.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

// Validation schemas
const customerSchema = Joi.object({
  name: Joi.string().required().trim(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
})

const bulkCustomerSchema = Joi.array().items(customerSchema).max(1000)

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
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
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { error, value } = customerSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const customer = new Customer(value)
    await customer.save()

    res.status(201).json({
      message: "Customer created successfully",
      customer,
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Customer with this email already exists" })
    }
    console.error("Create customer error:", error)
    res.status(500).json({ error: "Failed to create customer" })
  }
})

/**
 * @swagger
 * /api/customers/bulk:
 *   post:
 *     summary: Create multiple customers
 *     tags: [Customers]
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
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *     responses:
 *       201:
 *         description: Customers created successfully
 */
router.post("/bulk", verifyToken, async (req, res) => {
  try {
    const { error, value } = bulkCustomerSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const customers = await Customer.insertMany(value, { ordered: false })

    res.status(201).json({
      message: `${customers.length} customers created successfully`,
      customers,
    })
  } catch (error) {
    console.error("Bulk create customers error:", error)
    res.status(500).json({ error: "Failed to create customers" })
  }
})

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers with pagination
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of customers per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: List of customers
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const search = req.query.search || ""
    const skip = (page - 1) * limit

    // Build search query
    let query = {}
    if (search) {
      query = {
        $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }],
      }
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    const total = await Customer.countDocuments(query)

    res.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get customers error:", error)
    res.status(500).json({ error: "Failed to fetch customers" })
  }
})

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
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
 *         description: Customer details
 *       404:
 *         description: Customer not found
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" })
    }

    // Get customer's orders
    const orders = await Order.find({ customerId: customer._id }).sort({ orderDate: -1 }).limit(10)

    res.json({
      customer,
      orders,
    })
  } catch (error) {
    console.error("Get customer error:", error)
    res.status(500).json({ error: "Failed to fetch customer" })
  }
})

export default router
