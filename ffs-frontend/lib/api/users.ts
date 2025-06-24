import { sql } from "@/lib/db/connection"
import type { User } from "@/types/user"

export async function getAllUsers(): Promise<User[]> {
  // If no database connection, return empty array silently
  if (!sql) {
    return []
  }

  try {
    const result = await sql`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.status,
        u.last_login,
        u.demo_account,
        COALESCE(
          JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
              'type', ra.role_type,
              'scope', JSONB_BUILD_OBJECT(
                'type', CASE 
                  WHEN o.type = 'coop' THEN 'coop'
                  WHEN o.type = 'district' THEN 'district'
                  WHEN o.type = 'school' THEN 'school'
                  ELSE 'unknown'
                END,
                'id', o.id::text,
                'name', o.name
              ),
              'permissions', ra.permissions
            )
          ) FILTER (WHERE ra.id IS NOT NULL), 
          '[]'::json
        ) as roles,
        COALESCE(
          JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
              'type', bra.role_type,
              'scope', JSONB_BUILD_OBJECT(
                'type', CASE 
                  WHEN bo.type = 'coop' THEN 'coop'
                  WHEN bo.type = 'district' THEN 'district'
                  WHEN bo.type = 'school' THEN 'school'
                  ELSE 'unknown'
                END,
                'id', bo.id::text,
                'name', bo.name
              ),
              'permissions', bra.permissions
            )
          ) FILTER (WHERE bra.id IS NOT NULL), 
          '[]'::json
        ) as bid_roles,
        COALESCE(
          ARRAY_AGG(DISTINCT bm.bid_id::text) FILTER (WHERE bm.bid_id IS NOT NULL),
          ARRAY[]::text[]
        ) as managed_bids
      FROM users u
      LEFT JOIN role_assignments ra ON u.id = ra.user_id
      LEFT JOIN organizations o ON ra.organization_id = o.id
      LEFT JOIN bid_role_assignments bra ON u.id = bra.user_id
      LEFT JOIN organizations bo ON bra.organization_id = bo.id
      LEFT JOIN bid_managers bm ON u.id = bm.user_id
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.status, u.last_login, u.demo_account
      ORDER BY u.last_name, u.first_name
    `

    return result.map((row: any) => ({
      id: row.id.toString(),
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      roles: row.roles || [],
      bidRoles: row.bid_roles || [],
      managedBids: row.managed_bids || [],
      status: row.status as "Active" | "Inactive" | "Pending",
      lastLogin: row.last_login,
      demoAccount: row.demo_account || false,
    }))
  } catch (error) {
    return []
  }
}

export async function createUser(userData: Partial<User>): Promise<User> {
  if (!sql) {
    throw new Error("Database connection not available")
  }

  try {
    const result = await sql`
      INSERT INTO users (first_name, last_name, email, status, demo_account)
      VALUES (${userData.firstName}, ${userData.lastName}, ${userData.email}, ${userData.status || "Pending"}, ${userData.demoAccount || false})
      RETURNING *
    `

    const newUser = result[0]
    return {
      id: newUser.id.toString(),
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      email: newUser.email,
      roles: [],
      bidRoles: [],
      managedBids: [],
      status: newUser.status,
      lastLogin: newUser.last_login,
      demoAccount: newUser.demo_account,
    }
  } catch (error) {
    console.error("Failed to create user:", error)
    throw error
  }
}

export async function updateUser(userId: string, userData: Partial<User>): Promise<User> {
  if (!sql) {
    throw new Error("Database connection not available")
  }

  try {
    const result = await sql`
      UPDATE users 
      SET 
        first_name = COALESCE(${userData.firstName}, first_name),
        last_name = COALESCE(${userData.lastName}, last_name),
        email = COALESCE(${userData.email}, email),
        status = COALESCE(${userData.status}, status),
        last_login = COALESCE(${userData.lastLogin}, last_login),
        demo_account = COALESCE(${userData.demoAccount}, demo_account)
      WHERE id = ${userId}
      RETURNING *
    `

    if (result.length === 0) {
      throw new Error("User not found")
    }

    const updatedUser = result[0]
    return {
      id: updatedUser.id.toString(),
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      email: updatedUser.email,
      roles: userData.roles || [],
      bidRoles: userData.bidRoles || [],
      managedBids: userData.managedBids || [],
      status: updatedUser.status,
      lastLogin: updatedUser.last_login,
      demoAccount: updatedUser.demo_account,
    }
  } catch (error) {
    console.error("Failed to update user:", error)
    throw error
  }
}

export async function deleteUser(userId: string): Promise<void> {
  if (!sql) {
    throw new Error("Database connection not available")
  }

  try {
    await sql`DELETE FROM users WHERE id = ${userId}`
  } catch (error) {
    console.error("Failed to delete user:", error)
    throw error
  }
}
