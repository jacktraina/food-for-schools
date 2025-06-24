import { NextResponse } from "next/server"
import { sql } from "@/lib/db/connection"

export async function GET() {
  try {
    const schools = await sql`
      SELECT 
        id,
        name,
        type,
        parent_id as "parentId",
        coop_id as "coopId",
        is_in_coop as "isInCoop",
        address,
        city,
        state,
        zip,
        phone,
        fax,
        email,
        website,
        enrollment,
        school_type as "schoolType",
        status
      FROM organizations
      WHERE type = 'school'
      ORDER BY name
    `
    return NextResponse.json(schools)
  } catch (error) {
    console.error("Failed to fetch schools:", error)
    return NextResponse.json({ error: "Failed to fetch schools" }, { status: 500 })
  }
}
