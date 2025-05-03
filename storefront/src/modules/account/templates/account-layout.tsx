import React from "react"
import UnderlineLink from "@modules/common/components/interactive-link"
import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

/**
 * Exact same grid / sizing, colours now tied to the theme
 */
const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex-1 small:py-12" data-testid="account-page">
      <div
        className="
          flex-1 content-container h-full max-w-5xl mx-auto
          bg-[var(--surface)] text-[var(--text)]
          flex flex-col
        "
      >
        <div className="grid grid-cols-1 small:grid-cols-[240px_1fr] py-12">
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className="flex-1">{children}</div>
        </div>

        <div
          className="
            flex flex-col small:flex-row items-end justify-between gap-8
            small:border-t border-ui-border-base py-12
          "
        >
          <div>
            <h3 className="text-xl-semi mb-4">Got questions?</h3>
            <span className="txt-medium">
              You can find frequently asked questions and answers on our
              customer service page.
            </span>
          </div>

          <UnderlineLink href="/customer-service">
            Customer Service
          </UnderlineLink>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
