"use client"

import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery } from "react-query"
import { ArrowLeft, Users, MessageSquare, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react"
import { campaignsAPI } from "../services/api"
import LoadingSpinner from "../components/LoadingSpinner"

const CampaignDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery(["campaign", id], () => campaignsAPI.getById(id), {
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })

  const campaign = data?.data?.campaign
  const logs = data?.data?.logs || []

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      active: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getLogStatusIcon = (status) => {
    switch (status) {
      case "sent":
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getLogStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      sent: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getDeliveryRate = () => {
    if (!campaign) return 0
    const total = campaign.stats.sent + campaign.stats.failed
    if (total === 0) return 0
    return Math.round((campaign.stats.sent / total) * 100)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Campaign not found or failed to load</p>
        <Link to="/campaigns" className="btn-primary mt-4">
          Back to Campaigns
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate("/campaigns")} className="btn-outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}
            >
              {campaign.status}
            </span>
          </div>
          {campaign.description && <p className="text-gray-600">{campaign.description}</p>}
        </div>
      </div>

      {/* Campaign Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{campaign.audienceSize}</div>
          <div className="text-sm text-gray-600">Target Audience</div>
        </div>

        <div className="card text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{campaign.stats.sent}</div>
          <div className="text-sm text-gray-600">Messages Sent</div>
        </div>

        <div className="card text-center">
          <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{campaign.stats.failed}</div>
          <div className="text-sm text-gray-600">Failed Deliveries</div>
        </div>

        <div className="card text-center">
          <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{getDeliveryRate()}%</div>
          <div className="text-sm text-gray-600">Delivery Rate</div>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Campaign Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Created By</label>
              <p className="text-gray-900">{campaign.createdBy?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Created At</label>
              <p className="text-gray-900">{formatDate(campaign.createdAt)}</p>
            </div>
            {campaign.completedAt && (
              <div>
                <label className="text-sm font-medium text-gray-600">Completed At</label>
                <p className="text-gray-900">{formatDate(campaign.completedAt)}</p>
              </div>
            )}
            {campaign.aiGenerated && (
              <div>
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                  AI Generated Content
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Campaign Message */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Campaign Message</h3>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <MessageSquare className="w-5 h-5 text-gray-600 mb-2" />
            <p className="text-gray-900">{campaign.message}</p>
          </div>
        </div>
      </div>

      {/* Audience Rules */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Audience Rules</h3>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(campaign.rules, null, 2)}</pre>
        </div>
      </div>

      {/* Communication Logs */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Delivery Logs</h3>
          <p className="text-sm text-gray-600">Recent message delivery status</p>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No delivery logs available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivered At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Failure Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.slice(0, 50).map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.customerName}</div>
                        <div className="text-sm text-gray-500">{log.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getLogStatusIcon(log.status)}
                        <span
                          className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLogStatusColor(log.status)}`}
                        >
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.sentAt ? formatDate(log.sentAt) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.deliveredAt ? formatDate(log.deliveredAt) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{log.failureReason || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default CampaignDetails
