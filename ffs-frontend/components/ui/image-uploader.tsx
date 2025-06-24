"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Trash, Upload } from "lucide-react"
import { useTheme } from "./theme-context"

interface ImageUploaderProps {
  initialImage: string | null
  onImageChange: (imageUrl: string | null) => void
  aspectRatio?: "square" | "rectangle"
  maxWidth?: number
  maxHeight?: number
}

export function ImageUploader({
  initialImage,
  onImageChange,
  aspectRatio = "square",
  maxWidth = 200,
  maxHeight = 200,
}: ImageUploaderProps) {
  const [image, setImage] = useState<string | null>(initialImage)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { primaryColor } = useTheme()

  useEffect(() => {
    setImage(initialImage)
  }, [initialImage])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setImage(imageUrl)
        onImageChange(imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setImage(imageUrl)
        onImageChange(imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  // Determine dimensions based on aspect ratio
  const getContainerStyle = () => {
    if (aspectRatio === "square") {
      return {
        width: `${maxWidth}px`,
        height: `${maxWidth}px`,
      }
    } else {
      return {
        width: `${maxWidth}px`,
        height: `${maxHeight}px`,
      }
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 rounded-md flex items-center justify-center overflow-hidden ${
          isDragging ? "border-dashed border-blue-500 bg-blue-50" : "border-gray-200"
        }`}
        style={{
          ...getContainerStyle(),
          borderColor: isDragging ? primaryColor : undefined,
          backgroundColor: isDragging ? `${primaryColor}10` : undefined,
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {image ? (
          <img
            src={image || "/placeholder.svg?height=200&width=200&query=Upload"}
            alt="Uploaded image"
            className="w-full h-full object-contain"
            onError={(e) => {
              console.warn("Image failed to load, using fallback")
              e.currentTarget.src = "/abstract-colorful-swirls.png"
              e.currentTarget.onerror = null // Prevent infinite error loop
            }}
          />
        ) : (
          <div className="text-center p-4">
            <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Drag & drop an image here or click to upload</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClickUpload}
          style={{ borderColor: primaryColor, color: primaryColor }}
        >
          Upload Image
        </Button>
        {image && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <Trash className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>
    </div>
  )
}
