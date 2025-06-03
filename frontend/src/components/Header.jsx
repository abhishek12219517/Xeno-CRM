"use client"
import { useAuth } from "../contexts/AuthContext"
import { LogOut, User } from "lucide-react"

const Header = () => {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(" ")[0]}!</h1>
          <p className="text-sm text-gray-600">Manage your customer campaigns and segments</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            {user?.picture ? (
              <img 
                src={user.picture} 
                alt={user.name} 
                className="w-8 h-8 rounded-full" 
                referrerPolicy="no-referrer" 
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600">{user?.email}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="ml-2 hidden md:block">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
