import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function NewsFeed() {
  const newsItems = [
    {
      id: 1,
      title: "New Vendor Onboarding",
      description: "Three new vendors have joined the platform this week.",
      date: "Today",
      badge: "New",
      badgeColor: "bg-green-100 text-green-800 border-green-200",
    },
    {
      id: 2,
      title: "Bid Deadline Extended",
      description: "The deadline for the School Lunch Program bid has been extended to June 15th.",
      date: "Yesterday",
      badge: "Update",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      id: 3,
      title: "New Reporting Features",
      description: "Check out the new analytics dashboard with improved reporting capabilities.",
      date: "3 days ago",
      badge: "Feature",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    },
    {
      id: 4,
      title: "System Maintenance",
      description: "Scheduled maintenance will occur on Sunday, May 12th from 2-4 AM EST.",
      date: "1 week ago",
      badge: "Notice",
      badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
  ]

  return (
    <Card className="shadow-sm hover:shadow transition-shadow">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-white">
        <CardTitle>What's New</CardTitle>
        <CardDescription>Latest updates and announcements</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {newsItems.map((item, index) => (
          <div key={item.id}>
            <div className="flex justify-between items-start mb-1">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{item.title}</h3>
                  <Badge variant="outline" className={item.badgeColor}>
                    {item.badge}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </div>
              <span className="text-xs text-muted-foreground">{item.date}</span>
            </div>
            {index < newsItems.length - 1 && <Separator className="mt-3" />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
