"use client"

import type React from "react"
import type { User } from "@/types/user"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardSidebar } from "@/components/dashboard/sidebar-fixed"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Menu, Settings } from "lucide-react"
import { ToastContextProvider } from "@/components/ui/toast-context"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { ThemeProvider, useTheme } from "@/components/ui/theme-context"

// Import the ResetUserData component
import { ResetUserData } from "@/app/reset-user-data"

// Wrapper component that uses the theme context
function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userData, setUserData] = useState<User | null>(null)
  const { organizationLogo, primaryColor } = useTheme()

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User
        setUserData(parsedUser)
      } catch (e) {
        console.error("Failed to parse user data:", e)
        // If there's an error parsing user data, redirect to login
        router.push("/")
      }
    } else {
      // If no user data is found, redirect to login
      router.push("/")
    }
  }, [router])

  // Ensure organization logo is valid
  useEffect(() => {
    if (organizationLogo) {
      const img = new Image()
      img.onerror = () => {
        console.warn("Organization logo failed to load, using fallback")
        // The theme context will handle fallbacks
      }
      img.src = organizationLogo
    }
  }, [organizationLogo])

  // Load sidebar collapsed state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState !== null) {
      setSidebarCollapsed(savedState === "true")
    }
  }, [])

  // Save sidebar collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed))
  }, [sidebarCollapsed])

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user")
    localStorage.removeItem("accessToken")
    // Redirect to login page
    router.push("/")
  }

  // Get user initials for avatar fallback
  const getInitials = (user: User) => {
    if (!user.firstName && !user.lastName) return "U"

    const firstInitial = user.firstName ? user.firstName[0] : ""
    const lastInitial = user.lastName ? user.lastName[0] : ""

    return (firstInitial + lastInitial).toUpperCase()
  }

  // Always return the same organization name for all users
  const getOrganizationName = () => {
    return "Bid Pro Procurement Portal"
  }

  // If user data is still loading, show a loading state
  if (!userData) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  // Custom button style based on theme
  const buttonStyle = {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
  }

  return (
    <ToastContextProvider>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1">
          {/* Mobile sidebar backdrop */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-10 md:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Sidebar */}
          <div
            className={`fixed md:sticky top-0 h-screen z-20 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
              }`}
          >
            <DashboardSidebar
              collapsed={sidebarCollapsed}
              onToggle={handleToggleSidebar}
              userData={userData}
              organizationLogo={organizationLogo}
              primaryColor={primaryColor}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            <header className="sticky top-0 z-20 h-14 border-b flex items-center justify-between px-4 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden mr-2 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  style={{ color: primaryColor }}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
                <h1 className="text-lg font-medium" style={{ color: primaryColor }}>
                  {getOrganizationName()}
                </h1>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 outline-none">
                    <span className="text-sm font-medium hidden sm:inline-block">
                      {userData?.firstName && userData?.lastName
                        ? `${userData.firstName} ${userData.lastName}`
                        : "User"}
                    </span>
                    <Avatar className="h-8 w-8 cursor-pointer border-2" style={{ borderColor: `${primaryColor}30` }}>
                      {userData.profilePicture ? (
                        <AvatarImage
                          src={userData.profilePicture || "/placeholder.svg"}
                          alt={userData.name}
                          onError={(e) => {
                            // If profile picture fails to load, fallback to initials
                            e.currentTarget.src = "" // Clear the src to trigger fallback
                          }}
                        />
                      ) : (
                        <AvatarFallback style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                          {getInitials(userData)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-100">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                    Logged in as: {userData.roles.map((role) => role.type).join(", ")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                    <Settings className="mr-2 h-4 w-4" style={{ color: primaryColor }} />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>
            <main className="flex-1 p-4 bg-gray-50">{children}</main>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t px-4 py-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Food For Schools. All rights reserved.
            </div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">
                Terms
              </Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">
                Security
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </ToastContextProvider>
  )
}

// Add the ResetUserData component to the layout
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ResetUserData />
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ThemeProvider>
  )
}
