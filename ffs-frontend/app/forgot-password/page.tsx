import Link from "next/link"
import Image from "next/image"
import { ForgotPasswordForm } from "@/components/forgot-password-form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 pl-2">
          <Image
            src="/images/bid_pro_logo.png"
            alt="BidPro by Food For Schools Logo"
            width={180}
            height={60}
            priority
            className="h-auto"
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

      <main className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="mb-8 text-center">
          <Image
            src="/images/bid_pro_logo.png"
            alt="BidPro by Food For Schools Logo"
            width={320}
            height={100}
            priority
            className="h-auto"
          />
        </div>
        <div className="w-full max-w-md">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Reset your password</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you instructions to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ForgotPasswordForm />
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
                ← Back to login
              </Link>
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
