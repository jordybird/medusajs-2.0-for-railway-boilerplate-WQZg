/* storefront/src/app/[countryCode]/(checkout)/layout.tsx
   – checkout layout that respects dark-mode
*/
import React from "react"
import { ThemeProvider } from "@lib/providers/theme-providers"
import Nav       from "@modules/layout/templates/nav"
import MedusaCTA from "@modules/layout/components/medusa-cta"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <div className="w-full min-h-screen relative bg-background text-foreground">
        <Nav />

        {/* checkout content */}
        <div className="relative" data-testid="checkout-container">
          {children}
        </div>

        <div className="py-4 w-full flex items-center justify-center">
          <MedusaCTA />
        </div>
      </div>
    </ThemeProvider>
  )
}
