"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { USDANewsItem, getUSDANews } from "@/lib/api/dashboard"



export function USDAFeedClient() {
  const {
    data: feedItems = [],
    isLoading: loading,
    error,
    refetch: loadFeed
  } = useQuery<USDANewsItem[]>({
    queryKey: ['usda-news'],
    queryFn: getUSDANews,
    staleTime: 60 * 60 * 1000,
    retry: 2,
    retryDelay: 1000
  })

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    if (feedItems.length > 0) {
      setLastUpdated(new Date())
    }
  }, [feedItems])

  // Format date like "May 9, 2023"
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateString
    }
  }

  return (
    <Card className="shadow-sm hover:shadow transition-shadow">
      <CardHeader className="bg-green-50 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <div className="mr-3 flex-shrink-0">
            <Image src="/images/usda-logo.jpg" alt="USDA Logo" width={40} height={40} />
          </div>
          <div>
            <CardTitle className="mb-2">FNS Newsroom</CardTitle>
            <CardDescription>Latest news from USDA Food and Nutrition Service</CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => loadFeed()} disabled={loading} title="Refresh feed">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {loading && feedItems.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">Loading USDA updates...</div>
        ) : error && feedItems.length === 0 ? (
          <div className="py-8 text-center text-red-500">Failed to load USDA news. Please try again.</div>
        ) : feedItems.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No updates available</div>
        ) : (
          <>
            {feedItems.map((item, index) => (
              <div key={item.guid || index}>
                <div>
                  <h3 className="font-medium">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-green-700 hover:underline flex items-center"
                    >
                      {item.title}
                      <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
                    </a>
                  </h3>
                  <span className="text-xs text-muted-foreground block mt-1">{formatDate(item.pubDate)}</span>
                </div>
                {index < feedItems.length - 1 && <Separator className="my-3" />}
              </div>
            ))}
            {lastUpdated && (
              <div className="text-xs text-muted-foreground text-right pt-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
