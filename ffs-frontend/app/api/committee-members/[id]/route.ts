import { type NextRequest, NextResponse } from "next/server"
import { getCommitteeMemberById, updateCommitteeMember, deleteCommitteeMember } from "@/lib/api/committee-members"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const member = await getCommitteeMemberById(params.id)

    if (!member) {
      return NextResponse.json({ error: "Committee member not found" }, { status: 404 })
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error("Error fetching committee member:", error)
    return NextResponse.json({ error: "Failed to fetch committee member" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const memberData = await request.json()
    const updatedMember = await updateCommitteeMember(params.id, memberData)
    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error("Error updating committee member:", error)
    return NextResponse.json({ error: "Failed to update committee member" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteCommitteeMember(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting committee member:", error)
    return NextResponse.json({ error: "Failed to delete committee member" }, { status: 500 })
  }
}
