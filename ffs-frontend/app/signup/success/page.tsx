import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export default function SignupSuccessPage() {
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
        <div className="w-full max-w-md">
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle>Account Created Successfully!</CardTitle>
              <CardDescription>Your account has been created and is ready to use.</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p>
                We've sent a confirmation email to your inbox. Please verify your email address to complete the setup
                process.
              </p>
              <p className="text-sm text-muted-foreground">
                You can now sign in to your account and start setting up your organization.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Link href="/" className="w-full">
                <Button className="w-full">Sign In to Your Account</Button>
              </Link>
              <div className="text-center text-sm text-muted-foreground">
                Need help?{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact Support
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
