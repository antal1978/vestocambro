"use client"

import type React from "react"

// Simplified version of the use-toast.ts file
import { useState, useEffect } from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive" | "success" | "warning" | "info"
  duration?: number
  icon?: React.ReactNode
}

type ToastActionElement = React.ReactElement

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = ({ title, description, action, variant, duration = 5000, icon }: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = {
      id,
      title,
      description,
      action,
      variant,
      duration,
      icon,
    }
    setToasts((prevToasts) => [...prevToasts, newToast])

    return {
      id,
      dismiss: () => dismissToast(id),
      update: (props: Omit<ToastProps, "id">) => updateToast(id, props),
    }
  }

  const dismissToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  const updateToast = (id: string, props: Omit<ToastProps, "id">) => {
    setToasts((prevToasts) => prevToasts.map((toast) => (toast.id === id ? { ...toast, ...props } : toast)))
  }

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    toasts.forEach((toast) => {
      if (toast.duration) {
        const timer = setTimeout(() => {
          dismissToast(toast.id)
        }, toast.duration)
        timers.push(timer)
      }
    })

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [toasts])

  return {
    toast,
    toasts,
    dismiss: dismissToast,
  }
}

export type { ToastActionElement, ToastProps }
