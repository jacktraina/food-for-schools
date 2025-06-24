"use client"

import { useEffect } from "react"
import { getUserByEmail } from "@/types/user"

export function ResetUserData() {
  useEffect(() => {
    // Check if there's a user in localStorage
    const storedUser = localStorage.getItem("user")
    const token = localStorage.getItem("accessToken")

    if (storedUser && !token) {
      try {
        const parsedUser = JSON.parse(storedUser)
        // Get the fresh user data with updated role names
        const updatedUser = getUserByEmail(parsedUser.email)
        if (updatedUser) {
          // Update the user in localStorage
          localStorage.setItem("user", JSON.stringify(updatedUser))
          console.log("User data updated with latest role names")
        }
      } catch (e) {
        console.error("Failed to parse or update user data:", e)
      }
    }
  }, [])

  return null
}
