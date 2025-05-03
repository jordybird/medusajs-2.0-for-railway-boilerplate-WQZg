// storefront/src/modules/cart/templates/index.tsx
// ──────────────────────────────────────────────────

import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

interface CartTemplateProps {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}

const CartTemplate = ({ cart, customer }: CartTemplateProps) => {
  const hasItems = Boolean(cart?.items?.length)

  return (
    <div className="py-12">
      <div className="content-container" data-testid="cart-container">
        {hasItems ? (
          <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-x-10 gap-y-10">
            {/* ── Items list ── */}
            <section className="flex flex-col gap-y-6 bg-[#222222] text-white rounded-lg p-6">
              {!customer && (
                <>
                  <SignInPrompt />
                  <Divider className="border-gray-700" />
                </>
              )}
              {cart && <ItemsTemplate items={cart.items} />}
            </section>

            {/* ── Sticky summary ── */}
            <aside className="relative">
              <div className="flex flex-col gap-y-8 sticky top-12">
                {cart?.region && (
                  <section className="bg-[#222222] text-white rounded-lg p-6">
                    {/* pass the customer so Summary knows if they’re logged in */}
                    <Summary cart={cart as any} customer={customer} />
                  </section>
                )}
              </div>
            </aside>
          </div>
        ) : (
          <EmptyCartMessage />
        )}
      </div>
    </div>
  )
}

export default CartTemplate
