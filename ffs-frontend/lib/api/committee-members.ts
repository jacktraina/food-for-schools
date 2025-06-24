import { sql } from "@/lib/db/connection"
import { randomUUID } from "crypto"

export interface CommitteeMember {
  id: string
  userId?: string
  name: string
  district: string
  email: string
  phone?: string
  bidId: string
  isManager?: boolean
}

export async function getCommitteeMembersByBidId(bidId: string): Promise<CommitteeMember[]> {
  if (!sql) {
    console.error("No database connection available")
    return []
  }

  try {
    const result = await sql`
      SELECT 
        cm.id,
        cm.user_id as "userId",
        cm.name,
        cm.district,
        cm.email,
        cm.phone,
        cm.bid_id as "bidId"
      FROM committee_members cm
      WHERE cm.bid_id = ${bidId}
      ORDER BY cm.name
    `
    return result
  } catch (error) {
    console.error("Failed to fetch committee members from database:", error)
    return []
  }
}

export async function createCommitteeMember(memberData: Omit<CommitteeMember, "id">): Promise<CommitteeMember> {
  if (!sql) {
    throw new Error("Database connection not available")
  }

  try {
    // Generate UUIDs for the new committee member
    const newId = randomUUID()
    const externalId = randomUUID() // Generate external_id as well

    console.log("Creating committee member with data:", {
      id: newId,
      external_id: externalId,
      ...memberData,
    })

    const result = await sql`
      INSERT INTO committee_members (
        id, external_id, user_id, name, district, email, phone, bid_id, created_at, updated_at
      )
      VALUES (
        ${newId},
        ${externalId},
        ${memberData.userId || null}, 
        ${memberData.name}, 
        ${memberData.district}, 
        ${memberData.email}, 
        ${memberData.phone || null}, 
        ${memberData.bidId},
        NOW(),
        NOW()
      )
      RETURNING id, user_id as "userId", name, district, email, phone, bid_id as "bidId"
    `

    if (!result || result.length === 0) {
      throw new Error("Failed to create committee member - no result returned")
    }

    console.log("Successfully created committee member:", result[0])
    return result[0]
  } catch (error) {
    console.error("Failed to create committee member:", error)
    console.error("Error details:", error)
    throw error
  }
}

export async function getCommitteeMemberById(id: string): Promise<CommitteeMember | null> {
  if (!sql) {
    console.error("No database connection available")
    return null
  }

  try {
    const result = await sql`
      SELECT 
        cm.id,
        cm.user_id as "userId",
        cm.name,
        cm.district,
        cm.email,
        cm.phone,
        cm.bid_id as "bidId"
      FROM committee_members cm
      WHERE cm.id = ${id}
    `
    return result[0] || null
  } catch (error) {
    console.error("Failed to fetch committee member from database:", error)
    return null
  }
}

export async function updateCommitteeMember(
  id: string,
  memberData: Partial<CommitteeMember>,
): Promise<CommitteeMember> {
  if (!sql) {
    throw new Error("Database connection not available")
  }

  try {
    await sql`
      UPDATE committee_members 
      SET 
        user_id = COALESCE(${memberData.userId}, user_id),
        name = COALESCE(${memberData.name}, name),
        district = COALESCE(${memberData.district}, district),
        email = COALESCE(${memberData.email}, email),
        phone = COALESCE(${memberData.phone}, phone),
        updated_at = NOW()
      WHERE id = ${id}
    `

    const updatedMember = await getCommitteeMemberById(id)
    if (!updatedMember) throw new Error("Committee member not found")
    return updatedMember
  } catch (error) {
    console.error("Failed to update committee member:", error)
    throw error
  }
}

export async function deleteCommitteeMember(id: string): Promise<void> {
  if (!sql) {
    throw new Error("Database connection not available")
  }

  try {
    await sql`DELETE FROM committee_members WHERE id = ${id}`
  } catch (error) {
    console.error("Failed to delete committee member:", error)
    throw error
  }
}
