"use client"

import { useTheme } from "next-themes"
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { useEffect, useState } from "react"

/**
 * Small round button that flips the colour-mode.
 * – Uses `next-themes` to read / set the theme.
 * – Shows a sun when dark, a moon when light.
 */
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by rendering only after mount
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="
        inline-flex items-center justify-center
        h-9 w-9 rounded-full
        text-grey-60 dark:text-grey-20
        hover:bg-grey-10 dark:hover:bg-grey-80
        transition-colors
      "
    >
      {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  )
}
