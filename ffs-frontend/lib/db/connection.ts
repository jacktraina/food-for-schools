import { neon } from "@neondatabase/serverless"

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL

let sql: ReturnType<typeof neon> | null = null

if (databaseUrl) {
  try {
    sql = neon(databaseUrl)
  } catch (error) {
    console.error("Failed to initialize database connection:", error)
    sql = null
  }
} else {
  console.warn("DATABASE_URL environment variable not found")
  sql = null
}

export { sql }
