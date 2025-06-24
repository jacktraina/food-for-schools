import { NextResponse } from "next/server"
import { getAllUsers, createUser } from "@/lib/api/users"

export async function GET() {
  try {
    const users = await getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userData = await request.json()

    // Create the user in the database
    const newUser = await createUser({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      status: "Pending",
      demoAccount: false,
    })

    // Create role assignments if provided
    if (userData.role && userData.districtId) {
      try {
        // Use relative URL instead of absolute URL with environment variable
        await fetch(`/api/users/role-assignments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: newUser.id,
            roleType: userData.role,
            organizationId: userData.districtId,
            permissions: userData.permissions || [],
          }),
        })
      } catch (roleError) {
        console.error("Failed to create role assignment:", roleError)
      }
    }

    // Create bid role assignments if provided
    if (userData.bidRole && userData.districtId) {
      try {
        // Use relative URL instead of absolute URL with environment variable
        await fetch(`/api/users/bid-role-assignments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: newUser.id,
            roleType: userData.bidRole,
            organizationId: userData.districtId,
            permissions: userData.bidPermissions || [],
          }),
        })
      } catch (bidRoleError) {
        console.error("Failed to create bid role assignment:", bidRoleError)
      }
    }

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("Failed to create user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
