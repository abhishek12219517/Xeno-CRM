"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { X } from "lucide-react"
import { customersAPI } from "../services/api"
import toast from "react-hot-toast"
import LoadingSpinner from "./LoadingSpinner"
import { useMutation, useQueryClient } from "react-query"

const CustomerModal = ({ onClose, onSuccess }) => {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  // Create customer mutation
  const { mutate, isLoading } = useMutation(
    (data) => customersAPI.create(data),
    {
      onSuccess: () => {
        // Invalidate and refetch customers queries
        queryClient.invalidateQueries("customers")
        queryClient.invalidateQueries("dashboard-customers")
        toast.success("Customer created successfully!")
        onSuccess()
      },
      onError: (error) => {
        console.error("Create customer error:", error)
        toast.error(error.response?.data?.error || "Failed to create customer")
      }
    }
  )

  const onSubmit = async (data) => {
    // Process tags: convert comma-separated string to array
    const processedData = {
      ...data,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : [],
    }

    mutate(processedData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Add New Customer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="form-label">Name *</label>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              className="form-input"
              placeholder="Enter customer name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="form-label">Email *</label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
              className="form-input"
              placeholder="Enter email address"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="form-label">Phone</label>
            <input type="tel" {...register("phone")} className="form-input" placeholder="Enter phone number" />
          </div>

          <div>
            <label className="form-label">Tags</label>
            <input
              type="text"
              {...register("tags")}
              className="form-input"
              placeholder="Enter tags separated by commas"
            />
            <p className="text-gray-500 text-sm mt-1">Separate multiple tags with commas</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center" disabled={isLoading}>
              {isLoading && <LoadingSpinner size="small" className="mr-2" />}
              Create Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CustomerModal
