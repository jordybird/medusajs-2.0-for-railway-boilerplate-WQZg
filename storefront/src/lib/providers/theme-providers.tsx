"use client"

import { ThemeProvider as NextThemes } from "next-themes"
import React from "react"

/**
 * Global colour-mode wrapper
 * – adds `class="dark"` to <html> when the user / OS prefers dark
 * – no props exposed except `children`
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="class"         /* puts “dark” or “light” on <html> */
      defaultTheme="system"     /* follow OS preference by default  */
      enableSystem
      disableTransitionOnChange /* prevents flash on toggle         */
    >
      {children}
    </NextThemes>
  )
}
