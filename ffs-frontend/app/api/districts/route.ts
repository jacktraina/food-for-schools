import { NextResponse } from "next/server"
import { sql } from "@/lib/db/connection"

export async function GET() {
  try {
    const districts = await sql`
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
        status
      FROM organizations
      WHERE type = 'district'
      ORDER BY name
    `
    return NextResponse.json(districts)
  } catch (error) {
    console.error("Failed to fetch districts:", error)
    return NextResponse.json({ error: "Failed to fetch districts" }, { status: 500 })
  }
}
