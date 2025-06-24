import { type NextRequest, NextResponse } from "next/server"
import { getCommitteeMembersByBidId, createCommitteeMember } from "@/lib/api/committee-members"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bidId = searchParams.get("bidId")

    if (!bidId) {
      return NextResponse.json({ error: "bidId parameter is required" }, { status: 400 })
    }

    const members = await getCommitteeMembersByBidId(bidId)
    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching committee members:", error)
    return NextResponse.json({ error: "Failed to fetch committee members" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const memberData = await request.json()

    console.log("Received committee member data:", memberData)

    // Validate required fields
    if (!memberData.bidId) {
      return NextResponse.json({ error: "bidId is required" }, { status: 400 })
    }

    if (!memberData.name || !memberData.email) {
      return NextResponse.json({ error: "name and email are required" }, { status: 400 })
    }

    const newMember = await createCommitteeMember({
      userId: memberData.userId || null,
      name: memberData.name,
      district: memberData.district || "Not specified",
      email: memberData.email,
      phone: memberData.phone || null,
      bidId: memberData.bidId,
    })

    console.log("Created committee member:", newMember)
    return NextResponse.json(newMember, { status: 201 })
  } catch (error) {
    console.error("Error creating committee member:", error)
    return NextResponse.json(
      {
        error: "Failed to create committee member",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
