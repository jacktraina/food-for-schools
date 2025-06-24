import { NextResponse } from "next/server"
import { sql } from "@/lib/db/connection"

export async function GET() {
  try {
    const organizations = await sql`
      SELECT id, name, external_id, type
      FROM organizations
      ORDER BY type, name
    `
    return NextResponse.json(organizations)
  } catch (error) {
    console.error("Failed to fetch organizations:", error)
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 })
  }
}
