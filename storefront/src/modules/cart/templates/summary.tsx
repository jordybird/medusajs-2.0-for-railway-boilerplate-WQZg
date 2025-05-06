/* storefront/src/modules/cart/templates/summary.tsx
   Smart CTA flow:
     1) Sign-in  → /account
     2) Add DOB  → /account/profile
     3) Verify ID → verify-id?return_to=<encoded checkout URL>
     4) Checkout → /checkout?step=<address|delivery|payment>
*/
"use client"

import { Button, Heading } from "@medusajs/ui"
import CartTotals        from "@modules/common/components/cart-totals"
import Divider           from "@modules/common/components/divider"
import DiscountCode      from "@modules/checkout/components/discount-code"
import LocalizedLink     from "@modules/common/components/localized-client-link"
import { HttpTypes }     from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & { promotions: HttpTypes.StorePromotion[] }
  customer: HttpTypes.StoreCustomer | null
}

/* ── helper: determine the next checkout step ── */
const getCheckoutStep = (cart: HttpTypes.StoreCart) => {
  if (!cart?.shipping_address?.address_1 || !cart.email) return "address"
  if (cart?.shipping_methods?.length === 0)             return "delivery"
  return "payment"
}

const Summary = ({ cart, customer }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  /* -------- CTA decision matrix -------- */
  const notLoggedIn = !customer
  const missingDob  = customer && !customer.metadata?.dob
  const needsId =
    customer &&
    customer.metadata?.dob &&
    !customer.metadata?.id_verified

  // default: go straight to checkout
  const checkoutPath = `/checkout?step=${step}`        // absolute, used in return_to
  let   href  = checkoutPath                           // relative/absolute mix is fine
  let   label = "Go to checkout"

  if (notLoggedIn) {
    href  = "account"                                  // LocalizedLink adds /us/ etc.
    label = "Sign in to checkout"
  } else if (missingDob) {
    href  = "account/profile"
    label = "Add Date of Birth"
  } else if (needsId) {
    href  =
      `verify-id?return_to=${encodeURIComponent(checkoutPath)}`
    label = "Verify ID"
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

      <LocalizedLink href={href} data-testid="checkout-button">
        <Button className="w-full h-10">{label}</Button>
      </LocalizedLink>
    </div>
  )
}

export default Summary
