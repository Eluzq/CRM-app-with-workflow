"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  onClose?: () => void
}

export const Toast = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & ToastProps>(
  ({ className, title, description, variant = "default", onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed bottom-4 right-4 z-50 flex w-full max-w-md items-center justify-between rounded-lg border p-4 shadow-lg",
          variant === "destructive"
            ? "border-red-200 bg-red-50 text-red-800"
            : "border-gray-200 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
          className,
        )}
        {...props}
      >
        <div className="flex-1">
          {title && <h3 className="font-medium">{title}</h3>}
          {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
        </div>
        <button
          onClick={onClose}
          className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    )
  },
)
Toast.displayName = "Toast"

