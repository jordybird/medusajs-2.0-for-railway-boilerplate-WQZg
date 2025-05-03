import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MedusaCTA from "@modules/layout/components/medusa-cta"

/**
 * Entire footer rewritten so that:
 * • Light-mode  → white background.
 * • Dark-mode   → #18181B background (same as hero) with light text.
 * • Border darkens slightly in dark-mode.
 */
export default async function Footer() {
  const { collections }        = await getCollectionsList(0, 6)
  const { product_categories } = await getCategoriesList(0, 6)

  return (
    <footer
      className="
        w-full border-t border-ui-border-base dark:border-[#444444]
        bg-white dark:bg-[#18181B]
        text-ui-fg-subtle dark:text-grey-0
      "
    >
      <div className="content-container flex flex-col w-full">

        {/* ───────── Top block ───────── */}
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-40">

          {/* Brand */}
          <LocalizedClientLink
            href="/"
            className="
              txt-compact-xlarge-plus uppercase
              hover:text-ui-fg-base dark:hover:text-grey-5
            "
          >
            Medusa&nbsp;Store
          </LocalizedClientLink>

          {/* Links grid */}
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">

            {/* Categories */}
            {product_categories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base dark:text-grey-5">
                  Categories
                </span>

                <ul className="grid gap-2" data-testid="footer-categories">
                  {product_categories.slice(0, 6).map((c) => {
                    if (c.parent_category) return null

                    const children =
                      c.category_children?.map(({ id, name, handle }) => ({
                        id,
                        name,
                        handle,
                      })) ?? null

                    return (
                      <li key={c.id} className="flex flex-col gap-2 txt-small">
                        <LocalizedClientLink
                          href={`/categories/${c.handle}`}
                          className={clx(
                            "hover:text-ui-fg-base dark:hover:text-grey-5",
                            children && "txt-small-plus"
                          )}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>

                        {children && (
                          <ul className="grid gap-2 ml-3">
                            {children.map((child) => (
                              <li key={child.id}>
                                <LocalizedClientLink
                                  href={`/categories/${child.handle}`}
                                  className="hover:text-ui-fg-base dark:hover:text-grey-5"
                                  data-testid="category-link"
                                >
                                  {child.name}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* Collections */}
            {collections?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base dark:text-grey-5">
                  Collections
                </span>

                <ul
                  className={clx(
                    "grid gap-2 txt-small",
                    { "grid-cols-2": collections.length > 3 }
                  )}
                >
                  {collections.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        href={`/collections/${c.handle}`}
                        className="hover:text-ui-fg-base dark:hover:text-grey-5"
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Medusa links */}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base dark:text-grey-5">
                Medusa
              </span>

              <ul className="grid gap-y-2 txt-small">
                {[
                  ["https://github.com/medusajs", "GitHub"],
                  ["https://docs.medusajs.com", "Documentation"],
                  [
                    "https://github.com/medusajs/nextjs-starter-medusa",
                    "Source&nbsp;code",
                  ],
                ].map(([href, label]) => (
                  <li key={label as string}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-ui-fg-base dark:hover:text-grey-5"
                      dangerouslySetInnerHTML={{ __html: label }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ───────── Bottom line ───────── */}
        <div className="flex w-full mb-16 justify-between text-ui-fg-muted dark:text-grey-50">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} Medusa Store. All rights reserved.
          </Text>
          <MedusaCTA />
        </div>
      </div>
    </footer>
  )
}
