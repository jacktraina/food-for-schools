"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/components/login-form"
import { VendorLoginForm } from "@/components/vendor-login-form"

import { Button } from "@/components/ui/button"
export default function LoginPage() {
  
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 bg-white border-b px-6 py-3 flex items-center justify-between">
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

      <main className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        {/* <div className="text-center">
          <Image
            src="/images/bid_pro_logo.png"
            alt="BidPro by Food For Schools Logo"
            width={280}
            height={90}
            priority
            className="h-auto"
          />
        </div> */}
        <div className="w-full max-w-md mt-8 mb-8">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Sign in to your account</CardTitle>
              <CardDescription>Choose your account type to continue to the procurement portal</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="district" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="district">District/Coop</TabsTrigger>
                  <TabsTrigger value="vendor">Vendor</TabsTrigger>
                </TabsList>
                <TabsContent value="district">
                  <LoginForm />
                </TabsContent>
                <TabsContent value="vendor">
                  <VendorLoginForm />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col items-center space-y-2">
              <div className="text-center w-full mb-2">
                <p className="text-sm text-gray-500 mb-2">Need to register as a vendor?</p>
                <Link href="/vendor-registration">
                  <Button variant="outline" className="w-full">
                    Vendor Registration
                  </Button>
                </Link>
              </div>
              <div className="text-xs text-gray-400">
                By signing in, you agree to our{" "}
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
