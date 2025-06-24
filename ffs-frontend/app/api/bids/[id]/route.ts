import { type NextRequest, NextResponse } from "next/server"
import { getBidById, updateBid, deleteBid } from "@/lib/api/bids"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bid = await getBidById(params.id)
    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 })
    }
    return NextResponse.json(bid)
  } catch (error) {
    console.error("Failed to fetch bid:", error)
    return NextResponse.json({ error: "Failed to fetch bid" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bidData = await request.json()
    const updatedBid = await updateBid(params.id, bidData)
    return NextResponse.json(updatedBid)
  } catch (error) {
    console.error("Failed to update bid:", error)
    return NextResponse.json({ error: "Failed to update bid", details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteBid(params.id)
    return NextResponse.json({ message: "Bid deleted successfully" })
  } catch (error) {
    console.error("Failed to delete bid:", error)
    return NextResponse.json({ error: "Failed to delete bid", details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
