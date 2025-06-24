"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SchoolType, District } from "@/types/entities"

// Define address interface for consistency
interface AddressFields {
  line1: string
  line2: string
  city: string
  state: string
  zipCode: string
}

// Helper function to parse a single address string into address fields
function parseAddressString(addressString = ""): AddressFields {
  // Try to parse the address string into components
  const parts = addressString.split(",").map((part) => part.trim())

  // Default empty address
  const defaultAddress: AddressFields = {
    line1: "",
    line2: "",
    city: "",
    state: "",
    zipCode: "",
  }

  // If we have parts, try to map them to fields
  if (parts.length >= 3) {
    // Assume format is "line1, city, state zipCode" or "line1, line2, city, state zipCode"
    if (parts.length === 3) {
      // Handle "line1, city, state zipCode"
      defaultAddress.line1 = parts[0]
      defaultAddress.city = parts[1]

      // Try to split the last part into state and zip
      const stateZip = parts[2].split(" ")
      if (stateZip.length >= 2) {
        defaultAddress.state = stateZip[0]
        defaultAddress.zipCode = stateZip.slice(1).join(" ")
      } else {
        defaultAddress.state = parts[2]
      }
    } else if (parts.length >= 4) {
      // Handle "line1, line2, city, state zipCode"
      defaultAddress.line1 = parts[0]
      defaultAddress.line2 = parts[1]
      defaultAddress.city = parts[2]

      // Try to split the last part into state and zip
      const stateZip = parts[3].split(" ")
      if (stateZip.length >= 2) {
        defaultAddress.state = stateZip[0]
        defaultAddress.zipCode = stateZip.slice(1).join(" ")
      } else {
        defaultAddress.state = parts[3]
      }
    }
  } else if (parts.length > 0) {
    // If we can't parse properly, at least put the first part in line1
    defaultAddress.line1 = parts[0]
  }

  return defaultAddress
}

// Helper function to combine address fields into a single string
function formatAddressToString(address: AddressFields): string {
  const parts = [address.line1]

  if (address.line2) {
    parts.push(address.line2)
  }

  if (address.city || address.state || address.zipCode) {
    const cityStateZip = [
      address.city,
      address.state && address.zipCode ? `${address.state} ${address.zipCode}` : address.state || address.zipCode,
    ]
      .filter(Boolean)
      .join(", ")

    if (cityStateZip) {
      parts.push(cityStateZip)
    }
  }

  return parts.join(", ")
}

interface EditSchoolModalProps {
  school: any
  district: District
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updatedSchool: any) => void
}

export function EditSchoolModal({ school, district, open, onOpenChange, onSave }: EditSchoolModalProps) {
  // Parse existing addresses
  const schoolAddress = parseAddressString(school?.address)
  const schoolShippingAddress = parseAddressString(school?.shippingAddress)
  const schoolBillingAddress = parseAddressString(school?.billingAddress)
  const districtBillingAddressFields = parseAddressString(district?.billingAddress)

  const [formData, setFormData] = useState({
    ...school,
    // Primary address fields
    addressLine1: schoolAddress.line1 || "",
    addressLine2: schoolAddress.line2 || "",
    city: schoolAddress.city || "",
    state: schoolAddress.state || "",
    zipCode: schoolAddress.zipCode || "",

    // Shipping address fields
    shippingAddressLine1: schoolShippingAddress.line1 || "",
    shippingAddressLine2: schoolShippingAddress.line2 || "",
    shippingCity: schoolShippingAddress.city || "",
    shippingState: schoolShippingAddress.state || "",
    shippingZipCode: schoolShippingAddress.zipCode || "",

    // Billing fields
    overrideBillingInfo: school?.overrideBillingInfo || false,
    billingContact: school?.billingContact || "",
    billingAddressLine1: schoolBillingAddress.line1 || "",
    billingAddressLine2: schoolBillingAddress.line2 || "",
    billingCity: schoolBillingAddress.city || "",
    billingState: schoolBillingAddress.state || "",
    billingZipCode: schoolBillingAddress.zipCode || "",
    billingPhone: school?.billingPhone || "",
    billingEmail: school?.billingEmail || "",

    // Other fields
    type: (school?.type as SchoolType) || "",
    principal: school?.principal || "",
    primaryContact: school?.primaryContact || "",
    contactPhone: school?.contactPhone || "",
    contactEmail: school?.contactEmail || "",
    shippingInstructions: school?.shippingInstructions || "",
    deliveryHours: school?.deliveryHours || "",
    notes: school?.notes || "",
  })

  // Store the district billing info to use when override is off
  const districtBillingInfo = {
    billingContact: district?.billingContact || "No billing contact provided",
    billingAddressLine1: districtBillingAddressFields.line1 || "No address provided",
    billingAddressLine2: districtBillingAddressFields.line2 || "",
    billingCity: districtBillingAddressFields.city || "",
    billingState: districtBillingAddressFields.state || "",
    billingZipCode: districtBillingAddressFields.zipCode || "",
    billingPhone: district?.billingPhone || "No billing phone provided",
    billingEmail: district?.billingEmail || "No billing email provided",
  }

  // Get the billing information to display based on override status
  const displayBillingInfo = formData.overrideBillingInfo
    ? {
        billingContact: formData.billingContact,
        billingAddressLine1: formData.billingAddressLine1,
        billingAddressLine2: formData.billingAddressLine2,
        billingCity: formData.billingCity,
        billingState: formData.billingState,
        billingZipCode: formData.billingZipCode,
        billingPhone: formData.billingPhone,
        billingEmail: formData.billingEmail,
      }
    : districtBillingInfo

  if (!school) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: name === "enrollment" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      overrideBillingInfo: checked,
      // If turning on override, initialize with district values if school values are empty
      ...(checked && {
        billingContact: prev.billingContact || district?.billingContact || "",
        billingAddressLine1: prev.billingAddressLine1 || districtBillingAddressFields.line1 || "",
        billingAddressLine2: prev.billingAddressLine2 || districtBillingAddressFields.line2 || "",
        billingCity: prev.billingCity || districtBillingAddressFields.city || "",
        billingState: prev.billingState || districtBillingAddressFields.state || "",
        billingZipCode: prev.billingZipCode || districtBillingAddressFields.zipCode || "",
        billingPhone: prev.billingPhone || district?.billingPhone || "",
        billingEmail: prev.billingEmail || district?.billingEmail || "",
      }),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Format address fields back to strings for API compatibility
    const primaryAddress: AddressFields = {
      line1: formData.addressLine1,
      line2: formData.addressLine2,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
    }

    const shippingAddress: AddressFields = {
      line1: formData.shippingAddressLine1,
      line2: formData.shippingAddressLine2,
      city: formData.shippingCity,
      state: formData.shippingState,
      zipCode: formData.shippingZipCode,
    }

    const billingAddress: AddressFields = {
      line1: formData.billingAddressLine1,
      line2: formData.billingAddressLine2,
      city: formData.billingCity,
      state: formData.billingState,
      zipCode: formData.billingZipCode,
    }

    // Create the final school object with formatted addresses
    const updatedSchool = {
      ...formData,
      address: formatAddressToString(primaryAddress),
      shippingAddress: formatAddressToString(shippingAddress),
      billingAddress: formData.overrideBillingInfo ? formatAddressToString(billingAddress) : "",
    }

    onSave(updatedSchool)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[80vh] h-auto">
        <DialogHeader className="mb-2">
          <DialogTitle>Edit School</DialogTitle>
          <DialogDescription>Make changes to the school information below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <Tabs defaultValue="primary" className="w-full flex-1">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="primary">Primary Info</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            {/* Primary Information Tab */}
            <TabsContent value="primary" className="space-y-3 min-h-[40vh]">
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="name">School Name *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="enrollment">Enrollment *</Label>
                  <Input
                    id="enrollment"
                    name="enrollment"
                    type="number"
                    value={formData.enrollment}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="type">School Type</Label>
                  <Select
                    name="type"
                    value={formData.type}
                    onValueChange={(value) => setFormData((prev: any) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select school type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Middle School">Middle School</SelectItem>
                      <SelectItem value="Elementary School">Elementary School</SelectItem>
                      <SelectItem value="Childcare">Childcare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="principal">Principal</Label>
                  <Input
                    id="principal"
                    name="principal"
                    value={formData.principal}
                    onChange={handleChange}
                    placeholder="Name of school principal"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    placeholder="School phone number"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    placeholder="School email address"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website || ""}
                    onChange={handleChange}
                    placeholder="School website URL"
                  />
                </div>

                {/* Address Fields */}
                <div className="space-y-1 col-span-2">
                  <Label htmlFor="addressLine1">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    placeholder="Apartment, suite, unit, etc. (optional)"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" value={formData.state} onChange={handleChange} placeholder="State" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="ZIP Code"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    name="logo"
                    value={formData.logo || ""}
                    onChange={handleChange}
                    placeholder="URL to school logo"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Contact Information Tab */}
            <TabsContent value="contact" className="space-y-3 min-h-[40vh]">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="primaryContact">Primary Contact</Label>
                  <Input
                    id="primaryContact"
                    name="primaryContact"
                    value={formData.primaryContact}
                    onChange={handleChange}
                    placeholder="Name of primary contact"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="Contact phone number"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="Contact email address"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Shipping Information Tab */}
            <TabsContent value="shipping" className="space-y-3 min-h-[40vh]">
              <div className="grid grid-cols-4 gap-3">
                {/* Shipping Address Fields */}
                <div className="space-y-1 col-span-2">
                  <Label htmlFor="shippingAddressLine1">Address Line 1 *</Label>
                  <Input
                    id="shippingAddressLine1"
                    name="shippingAddressLine1"
                    value={formData.shippingAddressLine1}
                    onChange={handleChange}
                    required
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label htmlFor="shippingAddressLine2">Address Line 2</Label>
                  <Input
                    id="shippingAddressLine2"
                    name="shippingAddressLine2"
                    value={formData.shippingAddressLine2}
                    onChange={handleChange}
                    placeholder="Apartment, suite, unit, etc. (optional)"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="shippingCity">City *</Label>
                  <Input
                    id="shippingCity"
                    name="shippingCity"
                    value={formData.shippingCity}
                    onChange={handleChange}
                    required
                    placeholder="City"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="shippingState">State *</Label>
                  <Input
                    id="shippingState"
                    name="shippingState"
                    value={formData.shippingState}
                    onChange={handleChange}
                    required
                    placeholder="State"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="shippingZipCode">ZIP Code *</Label>
                  <Input
                    id="shippingZipCode"
                    name="shippingZipCode"
                    value={formData.shippingZipCode}
                    onChange={handleChange}
                    required
                    placeholder="ZIP Code"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="shippingInstructions">Shipping Instructions</Label>
                  <Input
                    id="shippingInstructions"
                    name="shippingInstructions"
                    value={formData.shippingInstructions}
                    onChange={handleChange}
                    placeholder="Special shipping instructions"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="deliveryHours">Delivery Hours</Label>
                  <Input
                    id="deliveryHours"
                    name="deliveryHours"
                    value={formData.deliveryHours}
                    onChange={handleChange}
                    placeholder="Preferred delivery hours"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Billing Information Tab */}
            <TabsContent value="billing" className="space-y-3 min-h-[40vh]">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="overrideBillingInfo"
                    checked={formData.overrideBillingInfo}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="overrideBillingInfo" className="font-medium">
                    Override District Billing Information
                  </Label>
                </div>

                <div className="space-y-3 border p-3 rounded-md">
                  <h3 className="font-medium">
                    {formData.overrideBillingInfo
                      ? "School-Specific Billing Information"
                      : "District Billing Information"}
                  </h3>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="billingContact">Billing Contact</Label>
                      <Input
                        id="billingContact"
                        name="billingContact"
                        value={displayBillingInfo.billingContact}
                        onChange={handleChange}
                        placeholder="Name of billing contact"
                        disabled={!formData.overrideBillingInfo}
                        className={!formData.overrideBillingInfo ? "bg-gray-100" : ""}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="billingPhone">Billing Phone</Label>
                      <Input
                        id="billingPhone"
                        name="billingPhone"
                        value={displayBillingInfo.billingPhone}
                        onChange={handleChange}
                        placeholder="Billing phone number"
                        disabled={!formData.overrideBillingInfo}
                        className={!formData.overrideBillingInfo ? "bg-gray-100" : ""}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="billingEmail">Billing Email</Label>
                      <Input
                        id="billingEmail"
                        name="billingEmail"
                        value={displayBillingInfo.billingEmail}
                        onChange={handleChange}
                        placeholder="Billing email address"
                        disabled={!formData.overrideBillingInfo}
                        className={!formData.overrideBillingInfo ? "bg-gray-100" : ""}
                      />
                    </div>

                    {/* Billing Address Fields */}
                    <div className="space-y-1 col-span-4">
                      <Label htmlFor="billingAddressLine1">Address Line 1</Label>
                      <Input
                        id="billingAddressLine1"
                        name="billingAddressLine1"
                        value={displayBillingInfo.billingAddressLine1}
                        onChange={handleChange}
                        placeholder="Street address"
                        disabled={!formData.overrideBillingInfo}
                        className={!formData.overrideBillingInfo ? "bg-gray-100" : ""}
                      />
                    </div>
                    <div className="space-y-1 col-span-4">
                      <Label htmlFor="billingAddressLine2">Address Line 2</Label>
                      <Input
                        id="billingAddressLine2"
                        name="billingAddressLine2"
                        value={displayBillingInfo.billingAddressLine2}
                        onChange={handleChange}
                        placeholder="Apartment, suite, unit, etc. (optional)"
                        disabled={!formData.overrideBillingInfo}
                        className={!formData.overrideBillingInfo ? "bg-gray-100" : ""}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="billingCity">City</Label>
                      <Input
                        id="billingCity"
                        name="billingCity"
                        value={displayBillingInfo.billingCity}
                        onChange={handleChange}
                        placeholder="City"
                        disabled={!formData.overrideBillingInfo}
                        className={!formData.overrideBillingInfo ? "bg-gray-100" : ""}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="billingState">State</Label>
                      <Input
                        id="billingState"
                        name="billingState"
                        value={displayBillingInfo.billingState}
                        onChange={handleChange}
                        placeholder="State"
                        disabled={!formData.overrideBillingInfo}
                        className={!formData.overrideBillingInfo ? "bg-gray-100" : ""}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="billingZipCode">ZIP Code</Label>
                      <Input
                        id="billingZipCode"
                        name="billingZipCode"
                        value={displayBillingInfo.billingZipCode}
                        onChange={handleChange}
                        placeholder="ZIP Code"
                        disabled={!formData.overrideBillingInfo}
                        className={!formData.overrideBillingInfo ? "bg-gray-100" : ""}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-3 min-h-[40vh]">
              <div className="space-y-1">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional notes about this school"
                  className="min-h-[150px]"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
