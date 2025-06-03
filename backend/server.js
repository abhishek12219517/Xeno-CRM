import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"

// Import routes
import authRoutes from "./routes/auth.js"
import customerRoutes from "./routes/customers.js"
import orderRoutes from "./routes/orders.js"
import campaignRoutes from "./routes/campaigns.js"
import aiRoutes from "./routes/ai.js"
import deliveryRoutes from "./routes/delivery.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Trust proxy - Add this line for Vercel deployment
app.set('trust proxy', 1)

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Xeno CRM API",
      version: "1.0.0",
      description: "Mini CRM Platform API for customer segmentation and campaign management",
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:5000",
        description: "Development server",
      },
    ],
  },
  apis: ["./routes/*.js"],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/campaigns", campaignRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/delivery", deliveryRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Xeno CRM API is running",
    timestamp: new Date().toISOString(),
  })
})

// Test route for verifying deployment
app.get("/api/test", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Backend API is working!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err)
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      status: err.status || 500,
    },
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: {
      message: "Route not found",
      status: 404,
    },
  })
})

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/xeno-crm")
  .then(() => {
    console.log("✅ Connected to MongoDB")
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`)
    })
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error)
    process.exit(1)
  })

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...")
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed.")
    process.exit(0)
  })
})
