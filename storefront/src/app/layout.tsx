import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"
import { ThemeProvider } from "@lib/providers/theme-providers"

import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

/**
 * Root layout: wraps the entire app with
 * next-themes ThemeProvider so dark-mode works.
 * No Medusa UI provider is required—the CSS-var
 * overrides in globals.css already handle colours.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
