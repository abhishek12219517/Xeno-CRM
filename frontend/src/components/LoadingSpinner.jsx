import { cn } from "../utils/cn"

const LoadingSpinner = ({ size = "medium", className }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8",
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-primary-600", sizeClasses[size])}
      />
    </div>
  )
}

export default LoadingSpinner
