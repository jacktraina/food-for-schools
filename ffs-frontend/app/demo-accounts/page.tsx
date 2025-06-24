import Link from "next/link"
import { DemoAccounts } from "@/components/demo-accounts"

export default function DemoAccountsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Demo Accounts</h1>
        <p className="text-muted-foreground mb-4">
          Use these accounts to test different roles in the Food For Schools Procurement Portal
        </p>
        <Link href="/" className="text-primary hover:underline">
          Go to Login Page
        </Link>
      </div>

      <DemoAccounts />

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Note: These accounts are for demonstration purposes only. In a production environment, each user would have
          their own unique credentials.
        </p>
      </div>
    </div>
  )
}
