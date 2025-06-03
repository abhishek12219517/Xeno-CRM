import { useQuery } from "react-query"
import { Link } from "react-router-dom"
import { Users, ShoppingCart, Megaphone, TrendingUp, Plus, ArrowRight } from "lucide-react"
import { customersAPI, ordersAPI, campaignsAPI } from "../services/api"
import LoadingSpinner from "../components/LoadingSpinner"

const Dashboard = () => {
  // Fetch dashboard data
  const { data: customersData, isLoading: customersLoading } = useQuery(
    "dashboard-customers",
    () => customersAPI.getAll({ limit: 5 }),
    { staleTime: 5 * 60 * 1000 },
  )

  const { data: ordersData, isLoading: ordersLoading } = useQuery(
    "dashboard-orders",
    () => ordersAPI.getAll({ limit: 5 }),
    { staleTime: 5 * 60 * 1000 },
  )

  const { data: campaignsData, isLoading: campaignsLoading } = useQuery(
    "dashboard-campaigns",
    () => campaignsAPI.getAll({ limit: 5 }),
    { staleTime: 5 * 60 * 1000 },
  )

  const stats = [
    {
      name: "Total Customers",
      value: customersData?.data?.pagination?.total || 0,
      icon: Users,
      color: "bg-blue-500",
      href: "/customers",
    },
    {
      name: "Total Orders",
      value: ordersData?.data?.pagination?.total || 0,
      icon: ShoppingCart,
      color: "bg-green-500",
      href: "/orders",
    },
    {
      name: "Active Campaigns",
      value: campaignsData?.data?.campaigns?.filter((c) => c.status === "active").length || 0,
      icon: Megaphone,
      color: "bg-purple-500",
      href: "/campaigns",
    },
    {
      name: "Total Revenue",
      value: `₹${ordersData?.data?.orders?.reduce((sum, order) => sum + order.amount, 0)?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: "bg-yellow-500",
      href: "/orders",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your CRM platform</p>
        </div>
        <Link to="/campaigns/create" className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customers */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Customers</h3>
              <Link
                to="/customers"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
              >
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {customersLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-3">
              {customersData?.data?.customers?.slice(0, 5).map((customer) => (
                <div key={customer._id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ₹{customer.totalSpending?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-gray-600">{customer.visits || 0} visits</p>
                  </div>
                </div>
              ))}
              {(!customersData?.data?.customers || customersData.data.customers.length === 0) && (
                <p className="text-gray-500 text-center py-4">No customers yet</p>
              )}
            </div>
          )}
        </div>

        {/* Recent Campaigns */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Campaigns</h3>
              <Link
                to="/campaigns"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
              >
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {campaignsLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-3">
              {campaignsData?.data?.campaigns?.slice(0, 5).map((campaign) => (
                <div key={campaign._id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900">{campaign.name}</p>
                    <p className="text-sm text-gray-600">{campaign.audienceSize} customers</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        campaign.status === "active"
                          ? "bg-green-100 text-green-800"
                          : campaign.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                </div>
              ))}
              {(!campaignsData?.data?.campaigns || campaignsData.data.campaigns.length === 0) && (
                <p className="text-gray-500 text-center py-4">No campaigns yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/customers"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
          >
            <Users className="w-8 h-8 text-primary-600 mb-2" />
            <h4 className="font-medium text-gray-900">Manage Customers</h4>
            <p className="text-sm text-gray-600">View and add customer data</p>
          </Link>

          <Link
            to="/orders"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
          >
            <ShoppingCart className="w-8 h-8 text-primary-600 mb-2" />
            <h4 className="font-medium text-gray-900">Track Orders</h4>
            <p className="text-sm text-gray-600">Monitor order history</p>
          </Link>

          <Link
            to="/campaigns/create"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
          >
            <Megaphone className="w-8 h-8 text-primary-600 mb-2" />
            <h4 className="font-medium text-gray-900">Create Campaign</h4>
            <p className="text-sm text-gray-600">Launch new marketing campaigns</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
