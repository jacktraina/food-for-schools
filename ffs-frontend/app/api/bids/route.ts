import { type NextRequest, NextResponse } from "next/server"
import { getAllBids, createBid } from "@/lib/api/bids"

export async function GET() {
  try {
    const bids = await getAllBids()
    return NextResponse.json(bids)
  } catch (error) {
    console.error("Failed to fetch bids:", error)
    return NextResponse.json({ error: "Failed to fetch bids" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const bidData = await request.json()
    console.log("Received bid data:", bidData)

    // Transform the data to match the database schema exactly
    const transformedData = {
      name: bidData.name,
      note: bidData.note,
      bidYear: bidData.bidYear,
      category: bidData.category,
      categoryId: bidData.categoryId,
      status: bidData.status,
      awardType: bidData.awardType,
      startDate: bidData.startDate,
      endDate: bidData.endDate,
      anticipatedOpeningDate: bidData.anticipatedOpeningDate,
      awardDate: bidData.awardDate,
      bidManagerId: bidData.bidManagerId, // Use bidManagerId
      description: bidData.description || bidData.note, // Use note as description if not provided
      estimatedValue: bidData.estimatedValue,
      organizationId: bidData.organizationId,
      organizationType: bidData.organizationType,
    }

    console.log("Transformed bid data:", transformedData)

    const newBid = await createBid(transformedData)
    return NextResponse.json(newBid, { status: 201 })
  } catch (error) {
    console.error("Failed to create bid:", error)
    return NextResponse.json({ error: "Failed to create bid", details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
