"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ImageUploader } from "@/components/ui/image-uploader"
import { useTheme } from "@/components/ui/theme-context"
import { useToast } from "@/components/ui/toast-context"

export default function DistrictSettingsPage() {
  const { primaryColor, organizationLogo, updateTheme } = useTheme()
  const { toast } = useToast()

  const [tempLogo, setTempLogo] = useState<string | null>(organizationLogo)
  const [tempColor, setTempColor] = useState<string>(primaryColor)
  const [isSaving, setIsSaving] = useState(false)

  const handleLogoChange = (imageUrl: string | null) => {
    setTempLogo(imageUrl)
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempColor(e.target.value)
  }

  const saveBrandingSettings = () => {
    setIsSaving(true)

    // Simulate API call with a timeout
    setTimeout(() => {
      updateTheme(tempColor, tempLogo)
      setIsSaving(false)
      toast({
        title: "Branding settings saved",
        description: "Your organization's branding has been updated successfully.",
        variant: "success",
      })
    }, 800)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
        <p className="text-muted-foreground mt-1">Configure organization-wide settings and preferences.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Branding</CardTitle>
              <CardDescription>Customize your organization's branding in the portal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="organization-logo">Organization Logo</Label>
                <p className="text-sm text-muted-foreground">
                  Upload your organization's logo to display in the portal. This will replace the default BidPro logo.
                </p>
                <ImageUploader
                  initialImage={tempLogo}
                  onImageChange={handleLogoChange}
                  aspectRatio="rectangle"
                  maxWidth={300}
                  maxHeight={100}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended size: 300px × 100px. PNG or SVG with transparent background works best.
                </p>
              </div>
              <Separator />
              <div className="space-y-4">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="primary-color"
                    type="color"
                    value={tempColor}
                    onChange={handleColorChange}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">Choose your organization's primary brand color</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="text-sm font-medium mb-2 w-full">Preview:</div>
                  <Button style={{ backgroundColor: tempColor, borderColor: tempColor }}>Primary Button</Button>
                  <Button variant="outline" style={{ borderColor: tempColor, color: tempColor }}>
                    Outline Button
                  </Button>
                </div>
              </div>
              <Button
                onClick={saveBrandingSettings}
                disabled={isSaving}
                style={{ backgroundColor: tempColor, borderColor: tempColor }}
              >
                {isSaving ? "Saving..." : "Save Branding Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>District Information</CardTitle>
              <CardDescription>Update your district's basic information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district-name">District Name</Label>
                  <Input id="district-name" defaultValue="Springfield School District" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district-code">District Code</Label>
                  <Input id="district-code" defaultValue="SSD-001" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district-address">Address</Label>
                <Input id="district-address" defaultValue="123 Education Ave, Springfield, IL 62701" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district-phone">Phone</Label>
                  <Input id="district-phone" defaultValue="(555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district-email">Email</Label>
                  <Input id="district-email" defaultValue="info@springfieldschools.edu" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district-website">Website</Label>
                <Input id="district-website" defaultValue="www.springfieldschools.edu" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fiscal Year Settings</CardTitle>
              <CardDescription>Configure your district's fiscal year and budget settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fiscal-year-start">Fiscal Year Start</Label>
                  <Input id="fiscal-year-start" type="date" defaultValue="2023-07-01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscal-year-end">Fiscal Year End</Label>
                  <Input id="fiscal-year-end" type="date" defaultValue="2024-06-30" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget-code">Budget Code Format</Label>
                <Input id="budget-code" defaultValue="FY-[YEAR]-[DEPT]-[CATEGORY]" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Permissions</CardTitle>
              <CardDescription>Configure who can access and modify district information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="permission-edit-district">Edit District Information</Label>
                    <p className="text-sm text-muted-foreground">Allow users to edit district information</p>
                  </div>
                  <Switch id="permission-edit-district" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="permission-add-schools">Add/Remove Schools</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to add or remove schools from the district
                    </p>
                  </div>
                  <Switch id="permission-add-schools" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="permission-manage-users">Manage Users</Label>
                    <p className="text-sm text-muted-foreground">Allow users to add or remove other users</p>
                  </div>
                  <Switch id="permission-manage-users" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="permission-view-reports">View Financial Reports</Label>
                    <p className="text-sm text-muted-foreground">Allow users to view financial reports</p>
                  </div>
                  <Switch id="permission-view-reports" defaultChecked />
                </div>
              </div>
              <Button className="mt-4">Save Permissions</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Integrations</CardTitle>
              <CardDescription>Connect your district to external systems and services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="integration-sis">Student Information System</Label>
                    <p className="text-sm text-muted-foreground">Connect to your SIS for student data</p>
                  </div>
                  <Switch id="integration-sis" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="integration-accounting">Accounting System</Label>
                    <p className="text-sm text-muted-foreground">Connect to your accounting system</p>
                  </div>
                  <Switch id="integration-accounting" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="integration-inventory">Inventory Management</Label>
                    <p className="text-sm text-muted-foreground">Connect to inventory management system</p>
                  </div>
                  <Switch id="integration-inventory" defaultChecked />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input id="api-key" type="password" value="••••••••••••••••••••••" readOnly className="font-mono" />
                  <Button variant="outline">Regenerate</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This API key provides access to your district data. Keep it secure.
                </p>
              </div>
              <Button className="mt-4">Save Integration Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
