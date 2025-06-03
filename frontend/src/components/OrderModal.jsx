"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { X } from "lucide-react"
import { ordersAPI } from "../services/api"
import toast from "react-hot-toast"
import LoadingSpinner from "./LoadingSpinner"

const OrderModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      // Convert amount to number
      const orderData = {
        ...data,
        amount: Number.parseFloat(data.amount),
        items: data.items
          ? data.items.split(",").map((item) => ({
              name: item.trim(),
              quantity: 1,
              price: Number.parseFloat(data.amount),
            }))
          : [],
      }

      await ordersAPI.create(orderData)
      toast.success("Order created successfully!")
      onSuccess()
    } catch (error) {
      console.error("Create order error:", error)
      toast.error(error.response?.data?.error || "Failed to create order")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Add New Order</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="form-label">Customer Email *</label>
            <input
              type="email"
              {...register("customerEmail", {
                required: "Customer email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
              className="form-input"
              placeholder="Enter customer email"
            />
            {errors.customerEmail && <p className="text-red-500 text-sm mt-1">{errors.customerEmail.message}</p>}
          </div>

          <div>
            <label className="form-label">Amount *</label>
            <input
              type="number"
              step="0.01"
              {...register("amount", {
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" },
              })}
              className="form-input"
              placeholder="Enter order amount"
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="form-label">Status</label>
            <select {...register("status")} className="form-input">
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="form-label">Items</label>
            <input
              type="text"
              {...register("items")}
              className="form-input"
              placeholder="Enter items separated by commas"
            />
            <p className="text-gray-500 text-sm mt-1">Separate multiple items with commas</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center" disabled={loading}>
              {loading && <LoadingSpinner size="small" className="mr-2" />}
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OrderModal
