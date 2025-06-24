import { supabase } from "@/lib/supabase"
import type { District, CreateDistrictPayload, CreateDistrictResponse } from "@/types/district"

export async function getAllDistricts(): Promise<District[]> {
  try {
    const { data: districts, error } = await supabase
      .from('districts')
      .select(`
        id,
        name,
        status,
        created_at,
        updated_at,
        organizations (
          id,
          name,
          type
        )
      `)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching districts:', error)
      return []
    }

    return districts?.map((district: any) => ({
      id: parseInt(district.id),
      name: district.name,
      status: district.status,
      schools: 0, // Default value - you can add a count query later
      students: 0, // Default value - you can add a count query later
    })) || []
  } catch (error) {
    console.error('Error in getAllDistricts:', error)
    return []
  }
}

export async function createDistrict(districtData: CreateDistrictPayload): Promise<CreateDistrictResponse> {
  try {
    const { data: newDistrict, error } = await supabase
      .from('districts')
      .insert({
        name: districtData.name,
        status: districtData.status || 'Active',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating district:', error)
      throw error
    }

    return {
      id: parseInt(newDistrict.id),
      name: newDistrict.name,
    }
  } catch (error) {
    console.error("Failed to create district:", error)
    throw error
  }
}

export async function updateDistrict(districtId: number, districtData: Partial<CreateDistrictPayload>): Promise<CreateDistrictResponse> {
  try {
    const updateData: any = {}
    if (districtData.name) updateData.name = districtData.name
    if (districtData.status) updateData.status = districtData.status

    const { data: updatedDistrict, error } = await supabase
      .from('districts')
      .update(updateData)
      .eq('id', districtId)
      .select()
      .single()

    if (error) {
      console.error('Error updating district:', error)
      throw error
    }

    return {
      id: parseInt(updatedDistrict.id),
      name: updatedDistrict.name,
    }
  } catch (error) {
    console.error("Failed to update district:", error)
    throw error
  }
}

export async function deleteDistrict(districtId: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('districts')
      .delete()
      .eq('id', districtId)

    if (error) {
      console.error('Error deleting district:', error)
      throw error
    }
  } catch (error) {
    console.error("Failed to delete district:", error)
    throw error
  }
}
