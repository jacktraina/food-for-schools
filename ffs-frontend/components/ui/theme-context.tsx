"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type ThemeContextType = {
  primaryColor: string
  organizationLogo: string | null
  updateTheme: (color: string, logo: string | null) => void
}

const defaultTheme = {
  primaryColor: "#1e40af", // Default blue color
  organizationLogo: null,
  updateTheme: () => {},
}

const ThemeContext = createContext<ThemeContextType>(defaultTheme)

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState(defaultTheme.primaryColor)
  const [organizationLogo, setOrganizationLogo] = useState<string | null>(defaultTheme.organizationLogo)

  // Load theme settings from localStorage on component mount
  useEffect(() => {
    const storedColor = localStorage.getItem("primaryColor")
    const storedLogo = localStorage.getItem("organizationLogo")

    if (storedColor) {
      setPrimaryColor(storedColor)
      // Apply the color to CSS variables
      document.documentElement.style.setProperty("--primary-color", storedColor)
      document.documentElement.style.setProperty("--primary-hover", adjustColorBrightness(storedColor, -10))
    }

    if (storedLogo) {
      setOrganizationLogo(storedLogo)
    }
  }, [])

  // Helper function to darken a color for hover states
  const adjustColorBrightness = (hex: string, percent: number) => {
    // Convert hex to RGB
    let r = Number.parseInt(hex.substring(1, 3), 16)
    let g = Number.parseInt(hex.substring(3, 5), 16)
    let b = Number.parseInt(hex.substring(5, 7), 16)

    // Adjust brightness
    r = Math.max(0, Math.min(255, r + percent))
    g = Math.max(0, Math.min(255, g + percent))
    b = Math.max(0, Math.min(255, b + percent))

    // Convert back to hex
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }

  const updateTheme = (color: string, logo: string | null) => {
    // Update state
    setPrimaryColor(color)
    setOrganizationLogo(logo)

    // Save to localStorage
    localStorage.setItem("primaryColor", color)
    if (logo) {
      localStorage.setItem("organizationLogo", logo)
    } else {
      localStorage.removeItem("organizationLogo")
    }

    // Apply the color to CSS variables
    document.documentElement.style.setProperty("--primary-color", color)
    document.documentElement.style.setProperty("--primary-hover", adjustColorBrightness(color, -10))
  }

  // Validate image URL
  const validateImageUrl = (url: string | null): string | null => {
    if (!url) return null

    // If it's a data URL or an absolute URL, return it
    if (url.startsWith("data:") || url.startsWith("http")) {
      return url
    }

    // For relative URLs, make sure they exist
    try {
      // For relative URLs, we'll assume they're valid but log a warning
      console.log(`Using relative image URL: ${url}`)
      return url
    } catch (e) {
      console.error(`Invalid image URL: ${url}`)
      return null
    }
  }

  // Validate the organization logo
  const validatedLogo = validateImageUrl(organizationLogo)

  return (
    <ThemeContext.Provider value={{ primaryColor, organizationLogo: validatedLogo, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
