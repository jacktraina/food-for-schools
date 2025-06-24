"use server"

import { XMLParser } from "fast-xml-parser"

export type USDAFeedItem = {
  title: string
  link: string
  description: string
  pubDate: string
  guid: string
}

// Mock data to use as fallback
const mockUSDAFeed: USDAFeedItem[] = [
  {
    title: "USDA Invests $151 Million in Rural Electric Infrastructure",
    link: "https://www.usda.gov/media/press-releases/2023/05/09/usda-invests-151-million-rural-electric-infrastructure",
    description:
      "The U.S. Department of Agriculture (USDA) today announced it is investing $151 million to build and improve critical rural electric infrastructure in 11 states.",
    pubDate: "Tue, 09 May 2023 10:00:00 -0500",
    guid: "https://www.usda.gov/media/press-releases/2023/05/09/usda-invests-151-million-rural-electric-infrastructure",
  },
  {
    title: "USDA Announces New Farm to School Grant Awards",
    link: "https://www.usda.gov/media/press-releases/2023/05/08/usda-announces-new-farm-school-grant-awards",
    description:
      "The U.S. Department of Agriculture (USDA) today announced the award of $12 million in Farm to School Grants to 102 projects across the country.",
    pubDate: "Mon, 08 May 2023 09:30:00 -0500",
    guid: "https://www.usda.gov/media/press-releases/2023/05/08/usda-announces-new-farm-school-grant-awards",
  },
  {
    title: "USDA Announces Funding for Rural Broadband Projects",
    link: "https://www.usda.gov/media/press-releases/2023/05/07/usda-announces-funding-rural-broadband-projects",
    description:
      "The U.S. Department of Agriculture (USDA) today announced it is investing $300 million to help rural residents and businesses in 24 states get access to high-speed internet.",
    pubDate: "Sun, 07 May 2023 11:15:00 -0500",
    guid: "https://www.usda.gov/media/press-releases/2023/05/07/usda-announces-funding-rural-broadband-projects",
  },
  {
    title: "USDA Updates School Nutrition Standards",
    link: "https://www.usda.gov/media/press-releases/2023/05/06/usda-updates-school-nutrition-standards",
    description:
      "The U.S. Department of Agriculture (USDA) today announced updates to the school nutrition standards that will help schools serve meals with more whole grains, less sodium, and less added sugar.",
    pubDate: "Sat, 06 May 2023 08:45:00 -0500",
    guid: "https://www.usda.gov/media/press-releases/2023/05/06/usda-updates-school-nutrition-standards",
  },
  {
    title: "USDA Announces New Conservation Program Enrollment",
    link: "https://www.usda.gov/media/press-releases/2023/05/05/usda-announces-new-conservation-program-enrollment",
    description:
      "The U.S. Department of Agriculture (USDA) today announced it will offer a new Conservation Reserve Program (CRP) signup period for agricultural producers and private landowners.",
    pubDate: "Fri, 05 May 2023 14:20:00 -0500",
    guid: "https://www.usda.gov/media/press-releases/2023/05/05/usda-announces-new-conservation-program-enrollment",
  },
]

export async function fetchUSDAFeed(): Promise<USDAFeedItem[]> {
  try {
    console.log("Fetching USDA feed...")

    // Try to fetch from the USDA RSS feed
    const response = await fetch("https://www.usda.gov/rss/latest-releases.xml", {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      console.error(`Failed to fetch USDA feed: ${response.status}`)
      return mockUSDAFeed // Return mock data if fetch fails
    }

    const xmlData = await response.text()
    console.log("Received XML data, parsing...")

    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    })

    const result = parser.parse(xmlData)

    // Extract items from the feed
    if (!result.rss || !result.rss.channel || !result.rss.channel.item) {
      console.error("Invalid RSS format")
      return mockUSDAFeed // Return mock data if parsing fails
    }

    const items = Array.isArray(result.rss.channel.item) ? result.rss.channel.item : [result.rss.channel.item] // Handle case where there's only one item

    // Map to our format
    const feedItems = items
      .map((item: any) => ({
        title: item.title || "No Title",
        link: item.link || "#",
        description: item.description || "No description available",
        pubDate: item.pubDate || new Date().toUTCString(),
        guid: item.guid || item.link || Math.random().toString(),
      }))
      .slice(0, 5) // Limit to 5 items

    console.log(`Successfully parsed ${feedItems.length} feed items`)
    return feedItems
  } catch (error) {
    console.error("Error fetching USDA feed:", error)
    return mockUSDAFeed // Return mock data on any error
  }
}
