import { NextResponse } from "next/server"
import { sql } from "@/lib/db/connection"
import { randomUUID } from "crypto"

export async function POST(request: Request) {
  try {
    const { districts } = await request.json()

    if (!Array.isArray(districts) || districts.length === 0) {
      return NextResponse.json({ error: "Invalid districts data" }, { status: 400 })
    }

    const insertedDistricts = []

    for (const district of districts) {
      // Generate a UUID for the district
      const id = randomUUID()

      // Insert the district
      const result = await sql`
        INSERT INTO organizations (
          id,
          name,
          type,
          parent_id,
          coop_id,
          is_in_coop,
          address,
          city,
          state,
          zip,
          phone,
          fax,
          email,
          website,
          status
        ) VALUES (
          ${id},
          ${district.name},
          'district',
          ${district.parentId || null},
          ${district.coopId || null},
          ${district.isInCoop || false},
          ${district.address || null},
          ${district.city || null},
          ${district.state || null},
          ${district.zip || null},
          ${district.phone || null},
          ${district.fax || null},
          ${district.email || null},
          ${district.website || null},
          ${district.status || "Active"}
        )
        RETURNING *
      `

      insertedDistricts.push(result[0])
    }

    return NextResponse.json(insertedDistricts)
  } catch (error) {
    console.error("Failed to bulk upload districts:", error)
    return NextResponse.json({ error: "Failed to bulk upload districts" }, { status: 500 })
  }
}
