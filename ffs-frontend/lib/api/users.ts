import { supabase } from "@/lib/supabase"
import type { User } from "@/types/user"

export async function getAllUsers(): Promise<User[]> {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        status,
        last_login,
        demo_account,
        role_assignments (
          role_type,
          permissions,
          organizations (
            id,
            name,
            type
          )
        ),
        bid_role_assignments (
          role_type,
          permissions,
          organizations (
            id,
            name,
            type
          )
        ),
        bid_managers (
          bid_id
        )
      `)
      .order('last_name', { ascending: true })

    if (error) {
      console.error('Error fetching users:', error)
      return []
    }

    return users?.map((user: any) => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      roles: user.role_assignments?.map((ra: any) => ({
        type: ra.role_type,
        scope: {
          type: ra.organizations?.type || 'unknown',
          id: ra.organizations?.id,
          name: ra.organizations?.name
        },
        permissions: ra.permissions || []
      })) || [],
      bidRoles: user.bid_role_assignments?.map((bra: any) => ({
        type: bra.role_type,
        scope: {
          type: bra.organizations?.type || 'unknown',
          id: bra.organizations?.id,
          name: bra.organizations?.name
        },
        permissions: bra.permissions || []
      })) || [],
      managedBids: user.bid_managers?.map((bm: any) => bm.bid_id) || [],
      status: user.status as "Active" | "Inactive" | "Pending",
      lastLogin: user.last_login,
      demoAccount: user.demo_account || false,
    })) || []
  } catch (error) {
    console.error('Error in getAllUsers:', error)
    return []
  }
}

export async function createUser(userData: Partial<User>): Promise<User> {
  try {
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        status: userData.status || "Pending",
        demo_account: userData.demoAccount || false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      throw error
    }

    return {
      id: newUser.id,
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
  try {
    const updateData: any = {}
    if (userData.firstName) updateData.first_name = userData.firstName
    if (userData.lastName) updateData.last_name = userData.lastName
    if (userData.email) updateData.email = userData.email
    if (userData.status) updateData.status = userData.status
    if (userData.lastLogin) updateData.last_login = userData.lastLogin
    if (userData.demoAccount !== undefined) updateData.demo_account = userData.demoAccount

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      throw error
    }

    return {
      id: updatedUser.id,
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
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  } catch (error) {
    console.error("Failed to delete user:", error)
    throw error
  }
}
