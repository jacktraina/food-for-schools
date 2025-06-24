"use client"

import * as React from "react"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
type ToastContextType = {
  toast: (props: { title?: string; description?: string; variant?: "default" | "destructive" | "success" }) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastContextProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = React.useCallback(
    ({
      title,
      description,
      variant = "default",
    }: { title?: string; description?: string; variant?: "default" | "destructive" | "success" }) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prevToasts) => [...prevToasts, { id, title, description, variant }])

      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
      }, 5000)
    },
    [],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastProvider>
        {children}
        {toasts.map(({ id, title, description, variant, ...props }) => (
          <Toast key={id} variant={variant} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastContextProvider")
  }
  return context
}
