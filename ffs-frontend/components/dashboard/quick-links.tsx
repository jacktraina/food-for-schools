import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  BarChart3,
  Building2,
  FileText,
  FilePlus,
  HelpCircle,
  ListChecks,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react"

export function QuickLinks() {
  const links = [
    {
      title: "New Bid",
      icon: FilePlus,
      href: "/dashboard/bids/create/page",
      color: "text-green-600 bg-green-50 hover:bg-green-100",
    },
    {
      title: "Districts",
      icon: Building2,
      href: "/dashboard/districts",
      color: "text-blue-600 bg-blue-50 hover:bg-blue-100",
    },
    {
      title: "Vendors",
      icon: Users,
      href: "/dashboard/vendors",
      color: "text-purple-600 bg-purple-50 hover:bg-purple-100",
    },
    {
      title: "Orders",
      icon: ShoppingCart,
      href: "/dashboard/orders",
      color: "text-orange-600 bg-orange-50 hover:bg-orange-100",
    },
    {
      title: "Reports",
      icon: BarChart3,
      href: "/dashboard/reports",
      color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100",
    },
    {
      title: "Tasks",
      icon: ListChecks,
      href: "/dashboard/tasks",
      color: "text-pink-600 bg-pink-50 hover:bg-pink-100",
    },
    {
      title: "Documents",
      icon: FileText,
      href: "/dashboard/documents",
      color: "text-yellow-600 bg-yellow-50 hover:bg-yellow-100",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      color: "text-gray-600 bg-gray-50 hover:bg-gray-100",
    },
    {
      title: "Help",
      icon: HelpCircle,
      href: "/dashboard/help",
      color: "text-teal-600 bg-teal-50 hover:bg-teal-100",
    },
  ]

  return (
    <Card className="shadow-sm hover:shadow transition-shadow">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
        <CardTitle>Quick Links</CardTitle>
        <CardDescription>Frequently used features and tools</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-3 gap-4">
          {links.map((link) => (
            <Link key={link.title} href={link.href} className="block cursor-pointer">
              <Button
                variant="ghost"
                className={`w-full h-auto flex flex-col items-center justify-center py-4 px-2 gap-2 rounded-lg cursor-pointer ${link.color}`}
              >
                <link.icon className="h-6 w-6" />
                <span className="text-xs font-medium">{link.title}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
