"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Loader2 } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [organizationType, setOrganizationType] = useState<"coop" | "district">("district")
  const [formData, setFormData] = useState({
    // Organization Info
    organizationName: "",
    organizationAddress: "",
    organizationCity: "",
    organizationState: "",
    organizationZip: "",
    organizationPhone: "",
    // Admin Info
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    adminConfirmPassword: "",
    // Bid Administrator (defaults to self)
    bidAdminSelf: true,
    bidAdminName: "",
    bidAdminEmail: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, bidAdminSelf: value === "self" }))
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Organization name is required"
    }

    if (!formData.organizationAddress.trim()) {
      newErrors.organizationAddress = "Address is required"
    }

    if (!formData.organizationCity.trim()) {
      newErrors.organizationCity = "City is required"
    }

    if (!formData.organizationState.trim()) {
      newErrors.organizationState = "State is required"
    }

    if (!formData.organizationZip.trim()) {
      newErrors.organizationZip = "ZIP code is required"
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.organizationZip)) {
      newErrors.organizationZip = "Please enter a valid ZIP code"
    }

    if (!formData.organizationPhone.trim()) {
      newErrors.organizationPhone = "Phone number is required"
    } else if (!/^$$\d{3}$$ \d{3}-\d{4}$/.test(formData.organizationPhone)) {
      newErrors.organizationPhone = "Please enter a valid phone number format: (XXX) XXX-XXXX"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.adminName.trim()) {
      newErrors.adminName = "Name is required"
    }

    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      newErrors.adminEmail = "Please enter a valid email address"
    }

    if (!formData.adminPassword) {
      newErrors.adminPassword = "Password is required"
    } else if (formData.adminPassword.length < 8) {
      newErrors.adminPassword = "Password must be at least 8 characters"
    }

    if (formData.adminPassword !== formData.adminConfirmPassword) {
      newErrors.adminConfirmPassword = "Passwords do not match"
    }

    if (!formData.bidAdminSelf) {
      if (!formData.bidAdminName.trim()) {
        newErrors.bidAdminName = "Bid administrator name is required"
      }

      if (!formData.bidAdminEmail.trim()) {
        newErrors.bidAdminEmail = "Bid administrator email is required"
      } else if (!/\S+@\S+\.\S+/.test(formData.bidAdminEmail)) {
        newErrors.bidAdminEmail = "Please enter a valid email address"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 2 && validateStep2()) {
      setIsLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real app, you would send the data to your API here
      console.log("Form submitted:", {
        organizationType,
        ...formData,
      })

      // Redirect to success page or login
      router.push("/signup/success")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 pl-2">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/food_for_schools_logo-HDyOX5uFOKagpyB6bX0AtmU7hDfzDc.png"
            alt="Food For Schools Logo"
            width={220}
            height={73}
            priority
          />
        </div>
        <div className="flex items-center gap-6 pr-2">
          <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
            About
          </Link>
          <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
            Contact
          </Link>
          <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">
            Help
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-50 pt-20">
        <div className="mb-4 text-center">
          <Image
            src="/images/bid_pro_logo.png"
            alt="BidPro by Food For Schools Logo"
            width={280}
            height={90}
            priority
            className="h-auto"
          />
        </div>
        <div className="w-full max-w-2xl">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Create a new account</CardTitle>
              <CardDescription>
                {organizationType === "coop"
                  ? "Set up a new cooperative group account"
                  : "Set up a new school district account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Tabs
                  value={organizationType}
                  onValueChange={(value) => setOrganizationType(value as "coop" | "district")}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-2">
                    <TabsTrigger value="district">School District</TabsTrigger>
                    <TabsTrigger value="coop">Cooperative Group</TabsTrigger>
                  </TabsList>
                  <p className="text-sm text-muted-foreground mt-2">
                    {organizationType === "coop"
                      ? "A cooperative group manages multiple school districts for collaborative procurement."
                      : "A school district account is for a single district managing its own procurement."}
                  </p>
                </Tabs>
              </div>

              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      {organizationType === "coop" ? "Cooperative Information" : "District Information"}
                    </h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="organizationName">
                          {organizationType === "coop" ? "Cooperative Name" : "District Name"}
                        </Label>
                        <Input
                          id="organizationName"
                          name="organizationName"
                          value={formData.organizationName}
                          onChange={handleChange}
                          placeholder={
                            organizationType === "coop" ? "Central State Cooperative" : "Springfield School District"
                          }
                        />
                        {errors.organizationName && <p className="text-sm text-red-500">{errors.organizationName}</p>}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="organizationAddress">Address</Label>
                        <Input
                          id="organizationAddress"
                          name="organizationAddress"
                          value={formData.organizationAddress}
                          onChange={handleChange}
                          placeholder="123 Main St"
                        />
                        {errors.organizationAddress && (
                          <p className="text-sm text-red-500">{errors.organizationAddress}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="organizationCity">City</Label>
                          <Input
                            id="organizationCity"
                            name="organizationCity"
                            value={formData.organizationCity}
                            onChange={handleChange}
                            placeholder="Springfield"
                          />
                          {errors.organizationCity && <p className="text-sm text-red-500">{errors.organizationCity}</p>}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="organizationState">State</Label>
                          <Input
                            id="organizationState"
                            name="organizationState"
                            value={formData.organizationState}
                            onChange={handleChange}
                            placeholder="IL"
                          />
                          {errors.organizationState && (
                            <p className="text-sm text-red-500">{errors.organizationState}</p>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="organizationZip">ZIP Code</Label>
                          <Input
                            id="organizationZip"
                            name="organizationZip"
                            value={formData.organizationZip}
                            onChange={handleChange}
                            placeholder="62701"
                          />
                          {errors.organizationZip && <p className="text-sm text-red-500">{errors.organizationZip}</p>}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="organizationPhone">Phone Number</Label>
                        <Input
                          id="organizationPhone"
                          name="organizationPhone"
                          value={formData.organizationPhone}
                          onChange={handleChange}
                          placeholder="(555) 123-4567"
                        />
                        {errors.organizationPhone && <p className="text-sm text-red-500">{errors.organizationPhone}</p>}
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button type="button" onClick={handleNext} className="w-full">
                        Next
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Administrator Information</h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="adminName">Your Name</Label>
                        <Input
                          id="adminName"
                          name="adminName"
                          value={formData.adminName}
                          onChange={handleChange}
                          placeholder="John Smith"
                        />
                        {errors.adminName && <p className="text-sm text-red-500">{errors.adminName}</p>}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="adminEmail">Your Email</Label>
                        <Input
                          id="adminEmail"
                          name="adminEmail"
                          type="email"
                          value={formData.adminEmail}
                          onChange={handleChange}
                          placeholder="john.smith@example.com"
                        />
                        {errors.adminEmail && <p className="text-sm text-red-500">{errors.adminEmail}</p>}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="adminPassword">Password</Label>
                        <Input
                          id="adminPassword"
                          name="adminPassword"
                          type="password"
                          value={formData.adminPassword}
                          onChange={handleChange}
                        />
                        {errors.adminPassword && <p className="text-sm text-red-500">{errors.adminPassword}</p>}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="adminConfirmPassword">Confirm Password</Label>
                        <Input
                          id="adminConfirmPassword"
                          name="adminConfirmPassword"
                          type="password"
                          value={formData.adminConfirmPassword}
                          onChange={handleChange}
                        />
                        {errors.adminConfirmPassword && (
                          <p className="text-sm text-red-500">{errors.adminConfirmPassword}</p>
                        )}
                      </div>

                      <div className="border-t pt-4 mt-2">
                        <h4 className="text-md font-medium mb-2">Bid Administrator Assignment</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          The Bid Administrator can create and manage bids, add items, and assign additional bid
                          managers.
                        </p>

                        <RadioGroup
                          value={formData.bidAdminSelf ? "self" : "other"}
                          onValueChange={handleRadioChange}
                          className="space-y-3"
                        >
                          <div className="flex items-start space-x-2 rounded-md border p-3">
                            <RadioGroupItem value="self" id="bid-admin-self" className="mt-1" />
                            <div className="grid gap-1.5 leading-none">
                              <label
                                htmlFor="bid-admin-self"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                I will be the Bid Administrator
                              </label>
                              <p className="text-sm text-muted-foreground">
                                You will have full access to create and manage bids
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-2 rounded-md border p-3">
                            <RadioGroupItem value="other" id="bid-admin-other" className="mt-1" />
                            <div className="grid gap-1.5 leading-none w-full">
                              <label
                                htmlFor="bid-admin-other"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Assign someone else as Bid Administrator
                              </label>
                              <p className="text-sm text-muted-foreground mb-2">
                                Designate another person to manage bids
                              </p>

                              {!formData.bidAdminSelf && (
                                <div className="grid gap-2 mt-2">
                                  <div className="grid gap-2">
                                    <Label htmlFor="bidAdminName">Bid Administrator Name</Label>
                                    <Input
                                      id="bidAdminName"
                                      name="bidAdminName"
                                      value={formData.bidAdminName}
                                      onChange={handleChange}
                                      placeholder="Jane Doe"
                                    />
                                    {errors.bidAdminName && (
                                      <p className="text-sm text-red-500">{errors.bidAdminName}</p>
                                    )}
                                  </div>

                                  <div className="grid gap-2">
                                    <Label htmlFor="bidAdminEmail">Bid Administrator Email</Label>
                                    <Input
                                      id="bidAdminEmail"
                                      name="bidAdminEmail"
                                      type="email"
                                      value={formData.bidAdminEmail}
                                      onChange={handleChange}
                                      placeholder="jane.doe@example.com"
                                    />
                                    {errors.bidAdminEmail && (
                                      <p className="text-sm text-red-500">{errors.bidAdminEmail}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button type="submit" className="flex-1" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center space-y-2">
              <div className="text-center w-full mb-2">
                <p className="text-sm text-gray-500 mb-2">Already have an account?</p>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </div>
              <div className="text-xs text-gray-400">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline">
                  Privacy Policy
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>

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
  )
}

