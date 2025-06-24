"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { fetchUSDAFeed, type USDAFeedItem } from "@/actions/fetch-usda-feed"
import { ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function USDAFeed() {
  const [feedItems, setFeedItems] = useState<USDAFeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadFeed = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Loading USDA feed...")

      // Set a timeout to ensure loading state doesn't get stuck
      const timeoutId = setTimeout(() => {
        if (loading && feedItems.length === 0) {
          console.log("Feed fetch timeout - using fallback data")
          // If we're still loading after 10 seconds, use fallback data
          setError("Feed loading timeout - using demo data")
          fetchUSDAFeed().then((data) => {
            setFeedItems(data)
            setLastUpdated(new Date())
            setLoading(false)
          })
        }
      }, 10000)

      const data = await fetchUSDAFeed()
      clearTimeout(timeoutId)

      console.log("Feed data received:", data)
      if (data.length === 0) {
        setError("No feed items available")
      } else {
        setFeedItems(data)
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error("Error in component while loading feed:", err)
      setError("Failed to load USDA feed - using demo data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeed()

    // Cleanup function
    return () => {
      console.log("Cleaning up USDA feed component")
    }
  }, [])

  // Format date like "May 9, 2023"
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    } catch (e) {
      return dateString
    }
  }

  // Truncate description to a reasonable length
  const truncateDescription = (description: string, maxLength = 120) => {
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength) + "..."
  }

  return (
    <Card className="shadow-sm hover:shadow transition-shadow">
      <CardHeader className="bg-gradient-to-r from-green-50 to-white flex flex-row items-center justify-between">
        <div>
          <CardTitle>USDA Updates</CardTitle>
          <CardDescription>Latest news from USDA</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={loadFeed} disabled={loading} title="Refresh feed">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {loading && feedItems.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">Loading USDA updates...</div>
        ) : error && feedItems.length === 0 ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : feedItems.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No updates available</div>
        ) : (
          <>
            {feedItems.map((item, index) => (
              <div key={item.guid || index}>
                <div className="flex justify-between items-start mb-1">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-green-700 hover:underline flex items-center"
                        >
                          {item.title}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </h3>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        USDA
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{truncateDescription(item.description)}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatDate(item.pubDate)}
                  </span>
                </div>
                {index < feedItems.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
            {lastUpdated && (
              <div className="text-xs text-muted-foreground text-right pt-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
                {error && " (using demo data)"}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
