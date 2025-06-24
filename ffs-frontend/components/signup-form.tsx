"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

export function SignupForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    organizationType: "coop", // Default to co-op
    organizationName: "",
    isBidAdmin: true, // Default to true
    bidAdminEmail: "", // Only used if isBidAdmin is false
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when field is changed
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.email) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password"
    if (!formData.firstName) newErrors.firstName = "First name is required"
    if (!formData.lastName) newErrors.lastName = "Last name is required"
    if (!formData.organizationName) newErrors.organizationName = "Organization name is required"
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms and conditions"

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    // Password confirmation
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    // Bid admin email validation if not self
    if (!formData.isBidAdmin && !formData.bidAdminEmail) {
      newErrors.bidAdminEmail = "Bid administrator email is required"
    }

    if (!formData.isBidAdmin && formData.bidAdminEmail && !/\S+@\S+\.\S+/.test(formData.bidAdminEmail)) {
      newErrors.bidAdminEmail = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // In a real application, you would send this data to your backend
      console.log("Form submitted:", formData)

      // Redirect to success page
      router.push("/signup/success")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>Sign up to start using the procurement portal.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Organization Type</Label>
            <RadioGroup
              value={formData.organizationType}
              onValueChange={(value) => handleChange("organizationType", value)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="coop" id="coop" />
                <Label htmlFor="coop" className="cursor-pointer">
                  Co-op Admin
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="district" id="district" />
                <Label htmlFor="district" className="cursor-pointer">
                  District Admin
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationName">
              {formData.organizationType === "coop" ? "Co-op Name" : "District Name"}
            </Label>
            <Input
              id="organizationName"
              value={formData.organizationName}
              onChange={(e) => handleChange("organizationName", e.target.value)}
              className={errors.organizationName ? "border-red-500" : ""}
            />
            {errors.organizationName && <p className="text-red-500 text-sm">{errors.organizationName}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isBidAdmin"
                checked={formData.isBidAdmin}
                onCheckedChange={(checked) => handleChange("isBidAdmin", checked)}
              />
              <Label htmlFor="isBidAdmin" className="cursor-pointer">
                I will be the Bid Administrator
              </Label>
            </div>
          </div>

          {!formData.isBidAdmin && (
            <div className="space-y-2">
              <Label htmlFor="bidAdminEmail">Bid Administrator Email</Label>
              <Input
                id="bidAdminEmail"
                type="email"
                value={formData.bidAdminEmail}
                onChange={(e) => handleChange("bidAdminEmail", e.target.value)}
                className={errors.bidAdminEmail ? "border-red-500" : ""}
              />
              {errors.bidAdminEmail && <p className="text-red-500 text-sm">{errors.bidAdminEmail}</p>}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleChange("agreeToTerms", checked)}
                className={errors.agreeToTerms ? "border-red-500" : ""}
              />
              <Label htmlFor="agreeToTerms" className="cursor-pointer">
                I agree to the terms and conditions
              </Label>
            </div>
            {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>}
          </div>

          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/" className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}
