import { NextResponse } from "next/server"
import { sql } from "@/lib/db/connection"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const district = await sql`
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
      WHERE id = ${params.id} AND type = 'district'
    `

    if (district.length === 0) {
      return NextResponse.json({ error: "District not found" }, { status: 404 })
    }

    return NextResponse.json(district[0])
  } catch (error) {
    console.error("Failed to fetch district:", error)
    return NextResponse.json({ error: "Failed to fetch district" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    // Update the district
    const result = await sql`
      UPDATE organizations
      SET 
        name = COALESCE(${body.name}, name),
        address = COALESCE(${body.address}, address),
        city = COALESCE(${body.city}, city),
        state = COALESCE(${body.state}, state),
        zip = COALESCE(${body.zip}, zip),
        phone = COALESCE(${body.phone}, phone),
        fax = COALESCE(${body.fax}, fax),
        email = COALESCE(${body.email}, email),
        website = COALESCE(${body.website}, website),
        status = COALESCE(${body.status}, status)
      WHERE id = ${params.id} AND type = 'district'
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "District not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Failed to update district:", error)
    return NextResponse.json({ error: "Failed to update district" }, { status: 500 })
  }
}
