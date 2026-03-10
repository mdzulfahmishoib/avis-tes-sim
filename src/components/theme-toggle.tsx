"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle({ hideText, className }: { hideText?: boolean, className?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size={hideText ? "icon" : "default"}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={cn(hideText ? "relative" : "w-full justify-start gap-3 px-3 relative h-9", className)}
    >
      <div className="flex items-center justify-center size-4 min-w-4">
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
      <span className="sr-only">Toggle theme</span>
      {!hideText && <span>Toggle Theme</span>}
    </Button>
  )
}
