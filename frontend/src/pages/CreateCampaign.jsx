"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Wand2, Users, MessageSquare, ArrowLeft, Eye, Sparkles } from "lucide-react"
import { campaignsAPI, aiAPI } from "../services/api"
import toast from "react-hot-toast"
import LoadingSpinner from "../components/LoadingSpinner"
import RuleBuilder from "../components/RuleBuilder"
import AIInputModal from "../components/AIInputModal"

const CreateCampaign = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [rules, setRules] = useState({})
  const [audiencePreview, setAudiencePreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [messageLoading, setMessageLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [showRulesModal, setShowRulesModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      message: "",
      aiGenerated: false,
    },
  })

  const watchedMessage = watch("message")

  // Step 1: Campaign Details
  const handleStep1Submit = (data) => {
    setStep(2)
  }

  // Step 2: Audience Rules
  const handleRulesChange = (newRules) => {
    setRules(newRules)
  }

  // Preview audience size
  const previewAudience = async () => {
    if (!rules || Object.keys(rules).length === 0) {
      toast.error("Please define audience rules first")
      return
    }

    try {
      setPreviewLoading(true)
      const response = await campaignsAPI.preview(rules)
      setAudiencePreview(response.data)
      toast.success(`Found ${response.data.audienceSize} customers matching your criteria`)
    } catch (error) {
      console.error("Preview error:", error)
      toast.error("Failed to preview audience")
    } finally {
      setPreviewLoading(false)
    }
  }

  // Generate rules from natural language
  const generateRulesFromAI = async () => {
    setShowRulesModal(true)
  }
  
  const handleRulesModalSubmit = async (prompt) => {
    if (!prompt) return
    
    try {
      setAiLoading(true)
      setShowRulesModal(false)
      const response = await aiAPI.generateRules(prompt)
      setRules(response.data.rules)
      toast.success(response.data.message)

      // Auto-preview the generated rules
      setTimeout(() => {
        previewAudience()
      }, 500)
    } catch (error) {
      console.error("AI rules generation error:", error)
      toast.error("Failed to generate rules from AI")
    } finally {
      setAiLoading(false)
    }
  }

  // Generate message suggestions
  const generateMessageSuggestions = async () => {
    setShowMessageModal(true)
  }
  
  const handleMessageModalSubmit = async (objective) => {
    if (!objective) return
    
    try {
      setMessageLoading(true)
      setShowMessageModal(false)
      const response = await aiAPI.generateMessage(objective, "Target audience based on defined rules")

      if (response.data.messages && response.data.messages.length > 0) {
        const selectedMessage = response.data.messages[0].message
        setValue("message", selectedMessage)
        setValue("aiGenerated", true)
        toast.success("Message generated successfully!")
      }
    } catch (error) {
      console.error("AI message generation error:", error)
      toast.error("Failed to generate message suggestions")
    } finally {
      setMessageLoading(false)
    }
  }

  // Final submission
  const onSubmit = async (data) => {
    if (!audiencePreview || audiencePreview.audienceSize === 0) {
      toast.error("Please preview your audience first")
      return
    }

    try {
      setSubmitLoading(true)
      const campaignData = {
        ...data,
        rules,
        audienceSize: audiencePreview.audienceSize,
      }

      const response = await campaignsAPI.create(campaignData)
      toast.success("Campaign created and launched successfully!")
      navigate("/campaigns")
    } catch (error) {
      console.error("Campaign creation error:", error)
      toast.error(error.response?.data?.error || "Failed to create campaign")
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate("/campaigns")} className="btn-outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Campaign</h1>
          <p className="text-gray-600">Launch a new marketing campaign</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${step >= 1 ? "text-primary-600" : "text-gray-400"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary-600 text-white" : "bg-gray-200"}`}
            >
              1
            </div>
            <span className="ml-2 font-medium">Campaign Details</span>
          </div>
          <div className={`flex items-center ${step >= 2 ? "text-primary-600" : "text-gray-400"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary-600 text-white" : "bg-gray-200"}`}
            >
              2
            </div>
            <span className="ml-2 font-medium">Audience Rules</span>
          </div>
          <div className={`flex items-center ${step >= 3 ? "text-primary-600" : "text-gray-400"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary-600 text-white" : "bg-gray-200"}`}
            >
              3
            </div>
            <span className="ml-2 font-medium">Message & Launch</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Campaign Details */}
        {step === 1 && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Campaign Details</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="form-label">Campaign Name *</label>
                <input
                  type="text"
                  {...register("name", { required: "Campaign name is required" })}
                  className="form-input"
                  placeholder="Enter campaign name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  {...register("description")}
                  className="form-input"
                  rows={3}
                  placeholder="Describe your campaign objectives"
                />
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={handleStep1Submit} className="btn-primary">
                  Next: Define Audience
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Audience Rules */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Define Your Audience</h3>
                  <button
                    type="button"
                    onClick={generateRulesFromAI}
                    disabled={aiLoading}
                    className="btn-outline flex items-center"
                  >
                    {aiLoading ? <LoadingSpinner size="small" className="mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    AI Assistant
                  </button>
                </div>
              </div>

              <RuleBuilder rules={rules} onChange={handleRulesChange} />

              <div className="flex justify-between pt-4">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                  Previous
                </button>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={previewAudience}
                    disabled={previewLoading}
                    className="btn-outline flex items-center"
                  >
                    {previewLoading ? (
                      <LoadingSpinner size="small" className="mr-2" />
                    ) : (
                      <Eye className="w-4 h-4 mr-2" />
                    )}
                    Preview Audience
                  </button>
                  <button type="button" onClick={() => setStep(3)} disabled={!audiencePreview} className="btn-primary">
                    Next: Create Message
                  </button>
                </div>
              </div>
            </div>

            {/* Audience Preview */}
            {audiencePreview && (
              <div className="card">
                <div className="card-header">
                  <h4 className="text-lg font-medium text-gray-900">Audience Preview</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-center p-6 bg-primary-50 rounded-lg">
                      <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-primary-600">{audiencePreview.audienceSize}</div>
                      <div className="text-sm text-gray-600">Customers will receive this campaign</div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Sample Customers</h5>
                    <div className="space-y-2">
                      {audiencePreview.sampleCustomers?.map((customer) => (
                        <div key={customer._id} className="flex justify-between text-sm">
                          <span>{customer.name}</span>
                          <span className="text-gray-600">₹{customer.totalSpending?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Message & Launch */}
        {step === 3 && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Campaign Message</h3>
                <button
                  type="button"
                  onClick={generateMessageSuggestions}
                  disabled={messageLoading}
                  className="btn-outline flex items-center"
                >
                  {messageLoading ? (
                    <LoadingSpinner size="small" className="mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  AI Suggestions
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="form-label">Message *</label>
                <textarea
                  {...register("message", { required: "Message is required" })}
                  className="form-input"
                  rows={4}
                  placeholder="Hi {name}, here's a special offer just for you!"
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                <p className="text-gray-500 text-sm mt-1">
                  Use {"{name}"} to personalize the message with customer names
                </p>
              </div>

              {/* Message Preview */}
              {watchedMessage && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Message Preview</h5>
                  <div className="text-sm text-gray-700">{watchedMessage.replace("{name}", "John Doe")}</div>
                </div>
              )}

              {/* Campaign Summary */}
              {audiencePreview && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Campaign Summary</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Audience Size:</span>
                      <span className="ml-2 font-medium">{audiencePreview.audienceSize} customers</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Expected Delivery:</span>
                      <span className="ml-2 font-medium">
                        ~{Math.round(audiencePreview.audienceSize * 0.9)} messages
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                  Previous
                </button>
                <button type="submit" disabled={submitLoading} className="btn-primary flex items-center">
                  {submitLoading ? (
                    <LoadingSpinner size="small" className="mr-2" />
                  ) : (
                    <MessageSquare className="w-4 h-4 mr-2" />
                  )}
                  Launch Campaign
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
      
      {/* AI Input Modals */}
      {showRulesModal && (
        <AIInputModal
          title="Define Your Audience"
          placeholder="Describe your target audience in natural language (e.g., customers who spent over $100 in the last 30 days)"
          onClose={() => setShowRulesModal(false)}
          onSubmit={handleRulesModalSubmit}
          loading={aiLoading}
        />
      )}
      {showMessageModal && (
        <AIInputModal
          title="Campaign Objective"
          placeholder="What's the objective of this campaign? (e.g., win-back, promotion, etc.)"
          onClose={() => setShowMessageModal(false)}
          onSubmit={handleMessageModalSubmit}
          loading={messageLoading}
        />
      )}
    </div>
  )
}

export default CreateCampaign
