"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import useAuth from "@/hooks/useAuth"

// Demo vendor accounts
const demoVendorAccounts = [
  {
    email: "demovendor@foodforschools.com",
    password: "Abc&123!",
    name: "Demo Vendor",
    role: "Vendor",
    organizationType: "Vendor",
    organizationId: "vendor1",
    permissions: ["view_bids", "submit_bids"],
  },
]

export function VendorLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  // const [error, setError] = useState("")
  const router = useRouter();
  const { error, login, setError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Check if the email and password match any of our demo vendor accounts
      const res = await login(email, password);
      if (res?.status === 200) {
        const responseData = res.data;
        localStorage.setItem("accessToken", responseData?.accessToken);
        localStorage.setItem("user", JSON.stringify(responseData?.user));
      }
      router.push("/dashboard")
    } catch (error) {
      setError("An error occurred during login. Please try again.")
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="vendor-email">Email</Label>
        <Input
          id="vendor-email"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="vendor-password">Password</Label>
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input
          id="vendor-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <div className="text-sm text-red-500">{error}</div>}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  )
}
