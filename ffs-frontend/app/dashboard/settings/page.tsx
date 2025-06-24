"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUploader } from "@/components/ui/image-uploader"
import type { User } from "@/types/user"
import { getUserByEmail } from "@/types/user"

export default function SettingsPage() {
  const [userData, setUserData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)

        // If we're in development/demo mode, get the demo user data
        // This ensures we're using the mock data for the demo
        const demoUser = getUserByEmail(parsedUser.email)
        if (demoUser) {
          // Preserve any user-specific settings like profile picture
          setUserData({
            ...demoUser,
            profilePicture: parsedUser.profilePicture || undefined,
          })
        } else {
          // Add profilePicture to match our User interface
          setUserData({
            ...parsedUser,
            profilePicture: parsedUser.profilePicture || undefined,
          })
        }
      } catch (e) {
        console.error("Failed to parse user data:", e)
      }
    }
    setIsLoading(false)
  }, [])

  const handleProfilePictureChange = (imageUrl: string | null) => {
    if (!userData) return

    const updatedUserData = {
      ...userData,
      profilePicture: imageUrl || undefined,
    }

    // Update state
    setUserData(updatedUserData)

    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(updatedUserData))
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (!userData) {
    return <div className="flex justify-center items-center h-64">User data not found</div>
  }

  // Get job title based on primary role
  const getJobTitle = () => {
    if (userData.roles.length === 0) return "Staff Member"

    const primaryRole = userData.roles[0].type
    switch (primaryRole) {
      case "Co-op Admin":
        return "Cooperative Administrator"
      case "District Admin":
        return "District Administrator"
      case "School Admin":
        return "School Administrator"
      case "Viewer":
        return "Procurement Analyst"
      default:
        return "Staff Member"
    }
  }

  // Get all user roles as a formatted string
  const getAllRoles = () => {
    if (userData.roles.length === 0) return "No roles assigned"

    return userData.roles
      .map((role) => {
        return `${role.type} (${role.scope.id})`
      })
      .join(", ")
  }

  // Get all user bid roles as a formatted string
  const getAllBidRoles = () => {
    if (!userData.bidRoles || userData.bidRoles.length === 0) return "No bid roles assigned"

    return userData.bidRoles
      .map((role) => {
        return `${role.type} (${role.scope.id})`
      })
      .join(", ")
  }

  // Get cooperatives the user is part of
  const getCooperatives = () => {
    const coops = userData.roles.filter((role) => role.scope.type === "coop").map((role) => role.scope.id)

    return [...new Set(coops)].join(", ") || "None"
  }

  // Get districts the user is part of
  const getDistricts = () => {
    const districts = userData.roles.filter((role) => role.scope.type === "district").map((role) => role.scope.id)

    return [...new Set(districts)].join(", ") || "None"
  }

  // Get schools the user is part of
  const getSchools = () => {
    const schools = userData.roles.filter((role) => role.scope.type === "school").map((role) => role.scope.id)

    return [...new Set(schools)].join(", ") || "None"
  }

  // Check if user is an admin of any kind
  const isAdmin = userData.roles.some(
    (role) => role.type === "Co-op Admin" || role.type === "District Admin" || role.type === "School Admin",
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-2">
                  <Label htmlFor="profile-picture" className="self-start mb-2">
                    Profile Picture
                  </Label>
                  <ImageUploader
                    initialImage={userData.profilePicture || null}
                    onImageChange={handleProfilePictureChange}
                    aspectRatio="square"
                    maxWidth={150}
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First name</Label>
                      <Input id="first-name" defaultValue={userData.name.split(" ")[0]} disabled={!isAdmin} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input
                        id="last-name"
                        defaultValue={userData.name.split(" ").length > 1 ? userData.name.split(" ")[1] : ""}
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue={userData.email} disabled />
                    {!isAdmin && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Only administrators can change email addresses
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cooperative">Cooperative</Label>
                    <Input id="cooperative" value={getCooperatives()} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input id="district" value={getDistricts()} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school">School</Label>
                    <Input id="school" value={getSchools()} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roles">Roles</Label>
                    <Input id="roles" value={getAllRoles()} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bid-roles">Bid Roles</Label>
                    <Input id="bid-roles" value={getAllBidRoles()} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job-title">Job Title</Label>
                    <Input id="job-title" defaultValue={getJobTitle()} disabled={!isAdmin} />
                  </div>
                </div>
              </div>
              {isAdmin && <Button>Save Changes</Button>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configure your notification preferences for emails, system alerts, and mobile notifications.
              </p>
              <Separator />
              <p className="text-sm">Notification settings will be added here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
