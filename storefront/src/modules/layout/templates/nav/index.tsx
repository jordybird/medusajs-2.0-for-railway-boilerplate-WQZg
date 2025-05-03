/* storefront/src/modules/layout/templates/nav/index.tsx */

import { Suspense } from "react"
import Image from "next/image"

import { listRegions } from "@lib/data/regions"
import { getCategoriesList } from "@lib/data/categories"
import { getCustomer } from "@lib/data/customer"

import { StoreRegion, StoreProductCategory } from "@medusajs/types"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import ThemeToggle from "@modules/layout/components/theme-toggle"

export default async function Nav() {
  /* fetch data in parallel */
  const [customer, regions, { product_categories }] = await Promise.all([
    getCustomer().catch(() => null),
    listRegions() as Promise<StoreRegion[]>,
    getCategoriesList(0, 6),
  ])

  const categories = (product_categories || []).filter(
    (c: StoreProductCategory) => !c.parent_category,
  )

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header
        className="
          relative mx-auto
          bg-white text-grey-90
          dark:bg-[#18181B] dark:text-grey-5
          border-b border-ui-border-base dark:border-[#444444]
        "
      >
        {/* ── main bar ── */}
        <nav
          className="
            content-container flex items-center justify-between w-full h-20
            txt-xsmall-plus
          "
        >
          {/* logo */}
          <div className="flex-shrink-0 h-full flex items-center">
            <LocalizedClientLink
              href="/"
              className="h-10 w-24 sm:w-28 md:w-32 lg:w-36 flex items-center"
            >
              <Image
                src="/logoo.svg"
                alt="Higherup"
                width={96}
                height={32}
                className="object-contain w-full h-auto mt-0 md:mt-12"
                priority
              />
            </LocalizedClientLink>
          </div>

          {/* search (desktop) */}
          <div className="ml-12 hidden md:flex flex-grow max-w-xl mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for anything"
                className="
                  w-full px-4 py-3 rounded-full outline-none
                  border border-grey-30 dark:border-grey-70
                  bg-grey-5 dark:bg-grey-80
                  text-grey-90 dark:text-grey-5
                  placeholder-grey-40 dark:placeholder-grey-60
                  focus:ring-2 focus:ring-lime-500 focus:border-lime-500
                "
              />
              <button
                className="
                  absolute right-0 top-0 h-full px-4
                  bg-lime-500 hover:bg-lime-600
                  text-white rounded-r-full
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 21l-6-6" />
                  <circle cx="11" cy="11" r="8" />
                </svg>
              </button>
            </div>
          </div>

          {/* actions */}
          <div className="flex items-center gap-x-4 h-full flex-shrink-0">
            {/* theme switch */}
            <ThemeToggle />

            {/* sign-in button (hide if logged in) */}
            {!customer && (
              <LocalizedClientLink
                href="/account"
                className="
                  px-4 py-2 rounded-full transition-colors
                  border border-grey-30 dark:border-grey-70
                  hover:border-lime-500 hover:text-lime-500
                "
                data-testid="nav-account-link"
              >
                Sign in
              </LocalizedClientLink>
            )}

            <Suspense
              fallback={
                <LocalizedClientLink
                  href="/cart"
                  className="
                    flex gap-2 px-4 py-2 rounded-full transition-colors
                    border border-grey-30 dark:border-grey-70
                    hover:border-lime-500 hover:text-lime-500
                  "
                  data-testid="nav-cart-link"
                >
                  Cart&nbsp;(0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>

            <div className="h-full">
              <SideMenu regions={regions} />
            </div>
          </div>
        </nav>

        {/* ── categories bar (desktop) ── */}
        <div className="hidden md:block bg-transparent">
          <div className="content-container py-3 text-sm flex justify-center">
            <div className="flex items-center space-x-3 overflow-x-auto pb-2 no-scrollbar max-w-4xl">
              {categories.length ? (
                categories.map((c) => (
                  <LocalizedClientLink
                    key={c.id}
                    href={`/categories/${c.handle}`}
                    className="
                      flex-shrink-0 px-3 py-1 rounded-full transition-colors
                      border border-grey-30 dark:border-grey-70
                      hover:border-lime-500 hover:text-lime-500
                    "
                  >
                    {c.name}
                  </LocalizedClientLink>
                ))
              ) : (
                <span className="text-grey-40">Loading categories…</span>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}
