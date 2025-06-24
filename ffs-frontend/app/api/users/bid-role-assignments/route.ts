import { NextResponse } from "next/server"
import { sql } from "@/lib/db/connection"

export async function POST(request: Request) {
  try {
    const { userId, roleType, organizationId, permissions } = await request.json()

    if (!sql) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
    }

    // Create bid role assignment
    const result = await sql`
      INSERT INTO bid_role_assignments (user_id, role_type, organization_id, permissions)
      VALUES (${userId}, ${roleType}, ${organizationId}, ${permissions})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create bid role assignment:", error)
    return NextResponse.json({ error: "Failed to create bid role assignment" }, { status: 500 })
  }
}
