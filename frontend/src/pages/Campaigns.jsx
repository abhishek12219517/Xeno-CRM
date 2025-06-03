"use client"

import { useState } from "react"
import { useQuery } from "react-query"
import { Link } from "react-router-dom"
import { Search, Plus, Filter, Eye, Calendar, Users, Megaphone } from "lucide-react"
import { campaignsAPI } from "../services/api"
import LoadingSpinner from "../components/LoadingSpinner"

const Campaigns = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const limit = 10

  // Fetch campaigns with pagination and search
  const { data, isLoading } = useQuery(
    ["campaigns", page, search],
    () => campaignsAPI.getAll({ page, limit, search }),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
    },
  )

  const campaigns = data?.data?.campaigns || []
  const pagination = data?.data?.pagination || {}

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(1) // Reset to first page when searching
  }

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

  const getDeliveryRate = (campaign) => {
    const total = campaign.stats.sent + campaign.stats.failed
    if (total === 0) return 0
    return Math.round((campaign.stats.sent / total) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600">Manage your marketing campaigns</p>
        </div>
        <Link to="/campaigns/create" className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={handleSearch}
              className="form-input pl-10"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="btn-outline flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <LoadingSpinner size="large" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-4">Create your first campaign to start engaging with customers</p>
            <Link to="/campaigns/create" className="btn-primary">
              Create Campaign
            </Link>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign._id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{campaign.name}</h3>
                  {campaign.description && <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>}
                </div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}
                >
                  {campaign.status}
                </span>
              </div>

              {/* Campaign Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-900">{campaign.audienceSize}</div>
                  <div className="text-xs text-gray-600">Audience</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{getDeliveryRate(campaign)}%</div>
                  <div className="text-xs text-gray-600">Delivery Rate</div>
                </div>
              </div>

              {/* Delivery Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sent:</span>
                  <span className="font-medium text-green-600">{campaign.stats.sent}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Failed:</span>
                  <span className="font-medium text-red-600">{campaign.stats.failed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivered:</span>
                  <span className="font-medium text-blue-600">{campaign.stats.delivered}</span>
                </div>
              </div>

              {/* Campaign Info */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(campaign.createdAt)}
                </div>
                {campaign.aiGenerated && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                    AI Generated
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Link to={`/campaigns/${campaign._id}`} className="flex-1 btn-outline flex items-center justify-center">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.pages}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Campaigns
