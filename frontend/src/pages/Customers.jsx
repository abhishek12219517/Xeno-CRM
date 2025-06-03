"use client"

import { useState } from "react"
import { useQuery } from "react-query"
import { Search, Plus, Filter, Download } from "lucide-react"
import { customersAPI } from "../services/api"
import LoadingSpinner from "../components/LoadingSpinner"
import CustomerModal from "../components/CustomerModal"

const Customers = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const limit = 10

  // Fetch customers with pagination and search
  const { data, isLoading, refetch } = useQuery(
    ["customers", page, search],
    () => customersAPI.getAll({ page, limit, search }),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
    },
  )

  const customers = data?.data?.customers || []
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
    })
  }

  const getActivityStatus = (lastVisit) => {
    const daysSinceVisit = Math.floor((new Date() - new Date(lastVisit)) / (1000 * 60 * 60 * 24))
    if (daysSinceVisit <= 7) return { label: "Active", color: "bg-green-100 text-green-800" }
    if (daysSinceVisit <= 30) return { label: "Recent", color: "bg-yellow-100 text-yellow-800" }
    return { label: "Inactive", color: "bg-red-100 text-red-800" }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customers by name or email..."
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
            <button className="btn-outline flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spending
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Visit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => {
                    const activityStatus = getActivityStatus(customer.lastVisit)
                    return (
                      <tr key={customer._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{customer.totalSpending?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.visits || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(customer.lastVisit)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${activityStatus.color}`}
                          >
                            {activityStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(customer.createdAt)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {customers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No customers found</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
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
          </>
        )}
      </div>

      {/* Customer Modal */}
      {showModal && (
        <CustomerModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            refetch()
          }}
        />
      )}
    </div>
  )
}

export default Customers
