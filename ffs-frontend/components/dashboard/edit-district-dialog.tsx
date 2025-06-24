"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface EditDistrictDialogProps {
  district: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (district: any) => void
}

// Helper function to parse address string into components
const parseAddressString = (addressString = "") => {
  // Default empty address structure
  const defaultAddress = {
    line1: "",
    line2: "",
    city: "",
    state: "",
    zipCode: "",
  }

  if (!addressString) return defaultAddress

  // Try to parse the address with common formats
  const parts = addressString.split(",").map((part) => part.trim())

  if (parts.length >= 3) {
    // Format: "123 Main St, Suite 100, City, State ZIP"
    // or: "123 Main St, City, State ZIP"
    const line1 = parts[0]
    let line2 = ""
    let cityStateZip = ""

    // Check if we have a second address line or if it's city, state zip
    if (parts.length >= 4) {
      line2 = parts[1]
      cityStateZip = parts[2]
    } else {
      cityStateZip = parts[1]
    }

    // Parse city, state, zip
    const lastPart = parts[parts.length - 1].trim()
    const stateZipMatch = lastPart.match(/([A-Z]{2})\s+(\d{5}(-\d{4})?)/)

    if (stateZipMatch) {
      const state = stateZipMatch[1]
      const zipCode = stateZipMatch[2]
      const city = parts[parts.length - 2].trim()

      return {
        line1,
        line2,
        city,
        state,
        zipCode,
      }
    }
  }

  // If we can't parse it properly, put everything in line1
  return {
    ...defaultAddress,
    line1: addressString,
  }
}

// Helper function to format address components into a string
const formatAddressToString = (address: {
  line1: string
  line2?: string
  city: string
  state: string
  zipCode: string
}) => {
  const { line1, line2, city, state, zipCode } = address
  let formattedAddress = line1

  if (line2 && line2.trim()) {
    formattedAddress += `, ${line2}`
  }

  if (city || state || zipCode) {
    formattedAddress += `, ${city}, ${state} ${zipCode}`
  }

  return formattedAddress
}

export function EditDistrictDialog({ district, open, onOpenChange, onSave }: EditDistrictDialogProps) {
  // Parse the address from the district object
  const parsedAddress = parseAddressString(district.address)
  const parsedBillingAddress = parseAddressString(district.billingAddress)

  const [formData, setFormData] = useState({
    ...district,
    // Replace single address fields with structured address
    addressLine1: parsedAddress.line1,
    addressLine2: parsedAddress.line2,
    city: parsedAddress.city,
    state: parsedAddress.state,
    zipCode: parsedAddress.zipCode,
    // Replace single billing address field with structured address
    billingAddressLine1: parsedBillingAddress.line1,
    billingAddressLine2: parsedBillingAddress.line2,
    billingCity: parsedBillingAddress.city,
    billingState: parsedBillingAddress.state,
    billingZipCode: parsedBillingAddress.zipCode,
  })

  const [newProduct, setNewProduct] = useState("")

  // Update form data when district changes
  useEffect(() => {
    if (district) {
      const parsedAddress = parseAddressString(district.address)
      const parsedBillingAddress = parseAddressString(district.billingAddress)

      setFormData({
        ...district,
        addressLine1: parsedAddress.line1,
        addressLine2: parsedAddress.line2,
        city: parsedAddress.city,
        state: parsedAddress.state,
        zipCode: parsedAddress.zipCode,
        billingAddressLine1: parsedBillingAddress.line1,
        billingAddressLine2: parsedBillingAddress.line2,
        billingCity: parsedBillingAddress.city,
        billingState: parsedBillingAddress.state,
        billingZipCode: parsedBillingAddress.zipCode,
      })
    }
  }, [district])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddProduct = () => {
    if (newProduct.trim() && !formData.participatingIn.includes(newProduct.trim())) {
      setFormData((prev) => ({
        ...prev,
        participatingIn: [...prev.participatingIn, newProduct.trim()],
      }))
      setNewProduct("")
    }
  }

  const handleRemoveProduct = (product: string) => {
    setFormData((prev) => ({
      ...prev,
      participatingIn: prev.participatingIn.filter((p: string) => p !== product),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Format the structured address fields back to strings for API compatibility
    const formattedAddress = formatAddressToString({
      line1: formData.addressLine1,
      line2: formData.addressLine2,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
    })

    const formattedBillingAddress = formatAddressToString({
      line1: formData.billingAddressLine1,
      line2: formData.billingAddressLine2,
      city: formData.billingCity,
      state: formData.billingState,
      zipCode: formData.billingZipCode,
    })

    // Create a copy of formData with the formatted addresses
    const submissionData = {
      ...formData,
      address: formattedAddress,
      billingAddress: formattedBillingAddress,
    }

    // Remove the structured address fields before submission
    delete submissionData.addressLine1
    delete submissionData.addressLine2
    delete submissionData.city
    delete submissionData.state
    delete submissionData.zipCode
    delete submissionData.billingAddressLine1
    delete submissionData.billingAddressLine2
    delete submissionData.billingCity
    delete submissionData.billingState
    delete submissionData.billingZipCode

    onSave(submissionData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[80vh] h-auto">
        <DialogHeader className="mb-2">
          <DialogTitle>Edit District Information</DialogTitle>
          <DialogDescription>Make changes to the district information below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <Tabs defaultValue="primary" className="w-full flex-1">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="primary">Primary Info</TabsTrigger>
              <TabsTrigger value="secondary">Secondary Contact</TabsTrigger>
              <TabsTrigger value="billing">Billing Info</TabsTrigger>
              <TabsTrigger value="bids">Bids</TabsTrigger>
            </TabsList>

            {/* Primary Information Tab */}
            <TabsContent value="primary" className="space-y-3 min-h-[40vh]">
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="name">District Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="directorName">Director Name</Label>
                  <Input id="directorName" name="directorName" value={formData.directorName} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" value={formData.email} onChange={handleChange} />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="fax">Fax</Label>
                  <Input id="fax" name="fax" value={formData.fax} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="enrollment">District Enrollment</Label>
                  <Input
                    id="enrollment"
                    name="enrollment"
                    type="number"
                    value={formData.enrollment}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="raNumber">RA Number</Label>
                  <Input id="raNumber" name="raNumber" value={formData.raNumber} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    name="logo"
                    value={formData.logo || ""}
                    onChange={handleChange}
                    placeholder="URL to district logo"
                  />
                </div>

                {/* Address Fields - Primary Info */}
                <div className="space-y-1 col-span-2">
                  <Label htmlFor="addressLine1">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="Street address, P.O. box"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                  <Input
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={formData.city} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    maxLength={2}
                    placeholder="CA"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="12345"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Secondary Contact Tab */}
            <TabsContent value="secondary" className="space-y-3 min-h-[40vh]">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="contact2">Contact Name</Label>
                  <Input id="contact2" name="contact2" value={formData.contact2} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contact2Phone">Contact Phone</Label>
                  <Input
                    id="contact2Phone"
                    name="contact2Phone"
                    value={formData.contact2Phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contact2Email">Contact Email</Label>
                  <Input
                    id="contact2Email"
                    name="contact2Email"
                    value={formData.contact2Email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Billing Information Tab */}
            <TabsContent value="billing" className="space-y-3 min-h-[40vh]">
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="billingContact">Billing Contact</Label>
                  <Input
                    id="billingContact"
                    name="billingContact"
                    value={formData.billingContact}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="billingPhone">Billing Phone</Label>
                  <Input id="billingPhone" name="billingPhone" value={formData.billingPhone} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="billingEmail">Billing Email</Label>
                  <Input id="billingEmail" name="billingEmail" value={formData.billingEmail} onChange={handleChange} />
                </div>

                {/* Billing Address Fields */}
                <div className="space-y-1 col-span-4">
                  <Label htmlFor="billingAddressLine1">Billing Address Line 1</Label>
                  <Input
                    id="billingAddressLine1"
                    name="billingAddressLine1"
                    value={formData.billingAddressLine1}
                    onChange={handleChange}
                    placeholder="Street address, P.O. box"
                  />
                </div>
                <div className="space-y-1 col-span-4">
                  <Label htmlFor="billingAddressLine2">Billing Address Line 2 (Optional)</Label>
                  <Input
                    id="billingAddressLine2"
                    name="billingAddressLine2"
                    value={formData.billingAddressLine2}
                    onChange={handleChange}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="billingCity">City</Label>
                  <Input id="billingCity" name="billingCity" value={formData.billingCity} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="billingState">State</Label>
                  <Input
                    id="billingState"
                    name="billingState"
                    value={formData.billingState}
                    onChange={handleChange}
                    maxLength={2}
                    placeholder="CA"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="billingZipCode">ZIP Code</Label>
                  <Input
                    id="billingZipCode"
                    name="billingZipCode"
                    value={formData.billingZipCode}
                    onChange={handleChange}
                    placeholder="12345"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Bids Tab */}
            <TabsContent value="bids" className="space-y-3 min-h-[40vh]">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new product"
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddProduct()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddProduct}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.participatingIn &&
                    formData.participatingIn.map((product: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-50 flex items-center gap-1"
                      >
                        {product}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 text-blue-700 hover:bg-blue-100 rounded-full"
                          onClick={() => handleRemoveProduct(product)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove {product}</span>
                        </Button>
                      </Badge>
                    ))}
                </div>
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
