"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { BarChart3, ChevronRight, Users, Zap, BarChart2, Shield, Moon, Sun } from "lucide-react"
import LoadingSpinner from "../components/LoadingSpinner"

const Login = () => {
  const { loginWithGoogle, loading } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
    
    // Initialize Google Sign-In
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      })

      window.google.accounts.id.renderButton(document.getElementById("google-signin-button"), {
        theme: darkMode ? "filled_black" : "outline",
        size: "large",
        width: 300,
        text: "signin_with",
      })
    }
    
    // Animation delay for elements to appear
    setTimeout(() => setIsVisible(true), 100)
  }, [darkMode])

  const toggleTheme = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
    
    // Re-render Google button with appropriate theme
    if (window.google) {
      window.google.accounts.id.renderButton(document.getElementById("google-signin-button"), {
        theme: newDarkMode ? "filled_black" : "outline",
        size: "large",
        width: 300,
        text: "signin_with",
      })
    }
  }

  const handleGoogleResponse = async (response) => {
    if (response.credential) {
      await loginWithGoogle(response.credential)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative transition-colors duration-300">
      {/* Theme toggle button */}
      <button 
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 z-20"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700" />
        )}
      </button>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
        <div className="absolute top-0 right-0 bg-primary-400 dark:bg-primary-600 rounded-full w-96 h-96 -mt-24 -mr-24 filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 bg-primary-600 dark:bg-primary-800 rounded-full w-80 h-80 -mb-24 -ml-24 filter blur-3xl animate-pulse-slow"></div>
      </div>
      
      <div className={`max-w-5xl w-full grid md:grid-cols-5 gap-8 z-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Left side - Branding and Features */}
        <div className="md:col-span-3 space-y-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-3 transition-transform duration-300">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Xeno CRM</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">Intelligent customer management</p>
            </div>
          </div>
          
          <div className="prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">Transform your <span className="text-primary-600 dark:text-primary-400">customer relationships</span> with data-driven insights</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mt-4">Xeno CRM helps you understand your customers better, create personalized campaigns, and drive meaningful engagement.</p>
          </div>
          
          {/* Features with icons */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700 group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-gray-700 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors duration-300">
                  <Users className="w-6 h-6 text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Smart Segmentation</h3>
                  <p className="text-gray-600 dark:text-gray-300">Create flexible customer segments with intuitive rules</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700 group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-gray-700 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors duration-300">
                  <Zap className="w-6 h-6 text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Powered Campaigns</h3>
                  <p className="text-gray-600 dark:text-gray-300">Create personalized campaigns with AI assistance</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700 group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-gray-700 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors duration-300">
                  <BarChart2 className="w-6 h-6 text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Real-time Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-300">Track campaign performance with comprehensive dashboards</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700 group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-gray-700 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors duration-300">
                  <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Secure Platform</h3>
                  <p className="text-gray-600 dark:text-gray-300">Enterprise-grade security with Google authentication</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Login */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80 transform transition-all duration-500 hover:translate-y-[-4px]">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Sign in to access your dashboard</p>
              </div>
              
              {/* Google Sign-In Button */}
              <div className="flex justify-center mt-8">
                <div id="google-signin-button" className="transform hover:scale-105 transition-transform duration-300"></div>
              </div>
              
              <div className="text-center mt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  By signing in, you agree to our <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium">Terms of Service</a> and <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium">Privacy Policy</a>
                </p>
              </div>
              
              {/* Testimonial */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                <div className="italic text-gray-600 dark:text-gray-300 text-sm">
                  "Xeno CRM has transformed how we engage with customers. The AI-powered campaign creation has increased our conversion rates by 40%."
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">Need help? <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium inline-flex items-center">Contact support <ChevronRight className="w-3 h-3 ml-1" /></a></p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className={`mt-16 text-center text-sm text-gray-500 dark:text-gray-400 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        © {new Date().getFullYear()} Xeno CRM. All rights reserved.
      </div>
    </div>
  )
}

export default Login
