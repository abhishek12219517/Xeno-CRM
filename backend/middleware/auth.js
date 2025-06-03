import jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library"
import User from "../models/User.js"

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({ error: "Invalid token. User not found." })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Token verification error:", error)
    res.status(401).json({ error: "Invalid token." })
  }
}

// Middleware to verify Google OAuth token
export const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    return ticket.getPayload()
  } catch (error) {
    console.error("Google token verification error:", error)
    throw new Error("Invalid Google token")
  }
}
