import { sql } from "@/lib/db/connection"

export interface Organization {
  id: string
  name: string
  type: "coop" | "district" | "school"
  parentId?: string
  coopId?: string
  isInCoop: boolean
  address?: string
  city?: string
  state?: string
  zip?: string
  phone?: string
  fax?: string
  email?: string
  website?: string
  enrollment?: number
  schoolType?: string
  status?: string
}

export async function getAllOrganizations(): Promise<Organization[]> {
  if (!sql) {
    console.error("No database connection available")
    return []
  }

  try {
    const result = await sql`
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
      ORDER BY name
    `
    return result
  } catch (error) {
    console.error("Failed to fetch organizations from database:", error)
    return []
  }
}

export async function getAllDistricts(): Promise<Organization[]> {
  if (!sql) {
    console.error("No database connection available")
    return []
  }

  try {
    const result = await sql`
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
    return result
  } catch (error) {
    console.error("Failed to fetch districts from database:", error)
    return []
  }
}

export async function getAllSchools(): Promise<Organization[]> {
  if (!sql) {
    console.error("No database connection available")
    return []
  }

  try {
    const result = await sql`
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
    return result
  } catch (error) {
    console.error("Failed to fetch schools from database:", error)
    return []
  }
}

export async function getSchoolsByDistrict(districtId: string): Promise<Organization[]> {
  if (!sql) {
    console.error("No database connection available")
    return []
  }

  try {
    const result = await sql`
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
      WHERE type = 'school' AND parent_id = ${districtId}
      ORDER BY name
    `
    return result
  } catch (error) {
    console.error("Failed to fetch schools from database:", error)
    return []
  }
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
  if (!sql) {
    console.error("No database connection available")
    return null
  }

  try {
    const result = await sql`
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
      WHERE id = ${id}
    `
    return result[0] || null
  } catch (error) {
    console.error("Failed to fetch organization from database:", error)
    return null
  }
}
