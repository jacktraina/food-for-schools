import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { districtId: string; schoolId: string } }
) {
  try {
    const { districtId, schoolId } = params
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/api/schools/${districtId}/${schoolId}`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const schoolData = await response.json()
    return NextResponse.json(schoolData)
  } catch (error) {
    console.error("Failed to fetch school details:", error)
    return NextResponse.json({ error: "Failed to fetch school details" }, { status: 500 })
  }
}
