import express from "express"
import axios from "axios"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

/**
 * @swagger
 * /api/ai/rules:
 *   post:
 *     summary: Convert natural language to segment rules
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Natural language description of the audience
 *     responses:
 *       200:
 *         description: Generated rules from natural language
 */
router.post("/rules", verifyToken, async (req, res) => {
  try {
    const { prompt } = req.body

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" })
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to rule-based parsing for demo
      const rules = parseNaturalLanguageRules(prompt)
      return res.json({
        rules,
        message: "Rules generated using fallback parser (OpenAI API key not configured)",
        aiGenerated: false,
      })
    }

    // Use OpenAI to convert natural language to rules
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that converts natural language descriptions into customer segmentation rules. 
            
            Convert the user's description into a JSON object with the following structure:
            {
              "operator": "AND" | "OR",
              "conditions": [
                {
                  "field": "totalSpending" | "visits" | "lastVisit",
                  "operator": "gt" | "lt" | "eq" | "before" | "after",
                  "value": number (for totalSpending/visits) or number of days (for lastVisit)
                }
              ]
            }
            
            For simple conditions, you can also return:
            {
              "totalSpending": { "operator": "gt", "value": 10000 },
              "visits": { "operator": "lt", "value": 3 },
              "lastVisit": { "operator": "before", "value": 90 }
            }
            
            Examples:
            - "People who spent more than 10000 and visited less than 3 times" -> AND condition
            - "Customers inactive for 90 days" -> lastVisit before 90 days
            - "High spenders over 5000 or frequent visitors with more than 10 visits" -> OR condition
            
            Only return valid JSON, no explanations.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    const aiResponse = response.data.choices[0].message.content.trim()

    try {
      const rules = JSON.parse(aiResponse)
      res.json({
        rules,
        message: "Rules generated successfully using AI",
        aiGenerated: true,
      })
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse)
      // Fallback to rule-based parsing
      const rules = parseNaturalLanguageRules(prompt)
      res.json({
        rules,
        message: "Rules generated using fallback parser (AI response parsing failed)",
        aiGenerated: false,
      })
    }
  } catch (error) {
    console.error("AI rules generation error:", error)

    // Fallback to rule-based parsing
    const rules = parseNaturalLanguageRules(req.body.prompt)
    res.json({
      rules,
      message: "Rules generated using fallback parser (AI service unavailable)",
      aiGenerated: false,
    })
  }
})

/**
 * @swagger
 * /api/ai/message:
 *   post:
 *     summary: Generate campaign message suggestions
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               objective:
 *                 type: string
 *                 description: Campaign objective
 *               audienceDescription:
 *                 type: string
 *                 description: Description of the target audience
 *     responses:
 *       200:
 *         description: Generated message suggestions
 */
router.post("/message", verifyToken, async (req, res) => {
  try {
    const { objective, audienceDescription } = req.body

    if (!objective) {
      return res.status(400).json({ error: "Objective is required" })
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to template-based messages
      const messages = generateTemplateMessages(objective, audienceDescription)
      return res.json({
        messages,
        message: "Messages generated using templates (OpenAI API key not configured)",
        aiGenerated: false,
      })
    }

    // Use OpenAI to generate message suggestions
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a marketing expert that creates personalized campaign messages. 
            
            Generate 3 different message variants for the given objective and audience.
            Each message should:
            - Be personalized (use {name} placeholder)
            - Include a clear call-to-action
            - Be concise and engaging
            - Match the campaign objective
            
            Return a JSON array of message objects:
            [
              {
                "message": "Hi {name}, here's 10% off on your next order!",
                "tone": "friendly",
                "cta": "Shop Now"
              }
            ]
            
            Only return valid JSON, no explanations.`,
          },
          {
            role: "user",
            content: `Objective: ${objective}\nAudience: ${audienceDescription || "General customers"}`,
          },
        ],
        max_tokens: 800,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    const aiResponse = response.data.choices[0].message.content.trim()

    try {
      const messages = JSON.parse(aiResponse)
      res.json({
        messages,
        message: "Messages generated successfully using AI",
        aiGenerated: true,
      })
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse)
      // Fallback to template-based messages
      const messages = generateTemplateMessages(objective, audienceDescription)
      res.json({
        messages,
        message: "Messages generated using templates (AI response parsing failed)",
        aiGenerated: false,
      })
    }
  } catch (error) {
    console.error("AI message generation error:", error)

    // Fallback to template-based messages
    const messages = generateTemplateMessages(req.body.objective, req.body.audienceDescription)
    res.json({
      messages,
      message: "Messages generated using templates (AI service unavailable)",
      aiGenerated: false,
    })
  }
})

// Fallback function to parse natural language rules
function parseNaturalLanguageRules(prompt) {
  const rules = {}
  const lowerPrompt = prompt.toLowerCase()

  // Parse spending patterns
  const spendingMatch = lowerPrompt.match(/spend(?:ing)?\s*(?:more than|over|above|>)\s*(?:inr\s*|₹\s*)?(\d+)/)
  if (spendingMatch) {
    rules.totalSpending = { operator: "gt", value: Number.parseInt(spendingMatch[1]) }
  }

  const spendingLessMatch = lowerPrompt.match(/spend(?:ing)?\s*(?:less than|under|below|<)\s*(?:inr\s*|₹\s*)?(\d+)/)
  if (spendingLessMatch) {
    rules.totalSpending = { operator: "lt", value: Number.parseInt(spendingLessMatch[1]) }
  }

  // Parse visit patterns
  const visitsMoreMatch = lowerPrompt.match(/visit(?:s)?\s*(?:more than|over|above|>)\s*(\d+)/)
  if (visitsMoreMatch) {
    rules.visits = { operator: "gt", value: Number.parseInt(visitsMoreMatch[1]) }
  }

  const visitsLessMatch = lowerPrompt.match(/visit(?:s)?\s*(?:less than|under|below|<)\s*(\d+)/)
  if (visitsLessMatch) {
    rules.visits = { operator: "lt", value: Number.parseInt(visitsLessMatch[1]) }
  }

  // Parse inactivity patterns
  const inactiveMatch = lowerPrompt.match(/inactive\s*(?:for)?\s*(\d+)\s*days?/)
  if (inactiveMatch) {
    rules.lastVisit = { operator: "before", value: Number.parseInt(inactiveMatch[1]) }
  }

  return rules
}

// Fallback function to generate template messages
function generateTemplateMessages(objective, audienceDescription) {
  const templates = {
    "win-back": [
      {
        message: "Hi {name}, we miss you! Come back and enjoy 15% off your next purchase.",
        tone: "friendly",
        cta: "Shop Now",
      },
      {
        message: "Hey {name}, it's been a while! Here's a special 20% discount just for you.",
        tone: "casual",
        cta: "Claim Offer",
      },
      {
        message: "Dear {name}, we'd love to have you back. Enjoy exclusive savings on your return!",
        tone: "formal",
        cta: "Return & Save",
      },
    ],
    promotion: [
      {
        message: "Hi {name}, don't miss our biggest sale! Up to 50% off everything.",
        tone: "exciting",
        cta: "Shop Sale",
      },
      {
        message: "Hey {name}, exclusive deal alert! Get 30% off your favorite items.",
        tone: "urgent",
        cta: "Get Deal",
      },
      {
        message: "Dear {name}, special promotion just for you - 25% off sitewide!",
        tone: "personal",
        cta: "Shop Now",
      },
    ],
    default: [
      {
        message: "Hi {name}, we have something special for you! Check out our latest offers.",
        tone: "friendly",
        cta: "Explore",
      },
      {
        message: "Hey {name}, don't miss out on our amazing deals and new arrivals!",
        tone: "casual",
        cta: "Discover",
      },
      {
        message: "Dear {name}, thank you for being a valued customer. Enjoy exclusive benefits!",
        tone: "appreciative",
        cta: "Learn More",
      },
    ],
  }

  const objectiveLower = objective.toLowerCase()
  let selectedTemplates = templates.default

  if (objectiveLower.includes("win") || objectiveLower.includes("back") || objectiveLower.includes("inactive")) {
    selectedTemplates = templates["win-back"]
  } else if (
    objectiveLower.includes("sale") ||
    objectiveLower.includes("promotion") ||
    objectiveLower.includes("discount")
  ) {
    selectedTemplates = templates.promotion
  }

  return selectedTemplates
}

export default router
