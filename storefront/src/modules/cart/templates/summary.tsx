/* storefront/src/modules/cart/templates/summary.tsx
   Smart CTA flow:
     1) Sign-in         → /account
     2) Add DOB         → /account/profile
     3) Verify ID       → /verify-id?return_to=<encoded checkout URL>
     4) 21-plus Checkout→ /checkout?step=<address|delivery|payment>
*/
"use client"

import { Button, Heading } from "@medusajs/ui"
import Divider           from "@modules/common/components/divider"
import DiscountCode      from "@modules/checkout/components/discount-code"
import CartTotals        from "@modules/common/components/cart-totals"
import LocalizedLink     from "@modules/common/components/localized-client-link"
import { HttpTypes }     from "@medusajs/types"
import { isIdVerified, is21Plus } from "@lib/util/customer-flags"

type SummaryProps = {
  cart: HttpTypes.StoreCart & { promotions: HttpTypes.StorePromotion[] }
  customer: HttpTypes.StoreCustomer | null
}

/* helper: which checkout step is next? */
const getCheckoutStep = (cart: HttpTypes.StoreCart) => {
  if (!cart?.shipping_address?.address_1 || !cart.email) return "address"
  if ((cart?.shipping_methods ?? []).length === 0)       return "delivery"
  return "payment"
}

export default function Summary({ cart, customer }: SummaryProps) {
  const step = getCheckoutStep(cart)

  /* -------- decision matrix -------- */
  const notLoggedIn = !customer
  const missingDob  = customer && !customer.metadata?.dob
  const needsId     = customer && !isIdVerified(customer)
  const under21     = customer && !is21Plus(customer)

  const checkoutPath = `/checkout?step=${step}`

  let href = checkoutPath
  let label = "Go to checkout"
  let disabled = false

  if (notLoggedIn) {
    href  = "account"
    label = "Sign in to checkout"
  } else if (missingDob) {
    href  = "account/profile"
    label = "Add Date of Birth"
  } else if (needsId) {
    href  = `verify-id?return_to=${encodeURIComponent(checkoutPath)}`
    label = "Verify ID"
  } else if (under21) {
    href     = "#"
    label    = "Must be 21+"
    disabled = true
  }

  /* -------- UI -------- */
  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Summary
      </Heading>

      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />

      <LocalizedLink href={href} aria-disabled={disabled}>
        <Button className="w-full h-10" disabled={disabled}>
          {label}
        </Button>
      </LocalizedLink>
    </div>
  )
}
