/* storefront/src/modules/home/components/nicotine/Rail.client.tsx */

"use client"

import React, { useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

interface Props {
  products: HttpTypes.StoreProduct[]
  collectionHandle: string
  title: string
}

export default function NicotineRail({
  products,
  collectionHandle,
  title,
}: Props) {
  const listRef = useRef<HTMLUListElement>(null)

  const scroll = (dir: "left" | "right") => {
    const el = listRef.current
    if (!el) return
    el.scrollBy({
      left: dir === "left" ? -el.clientWidth * 0.8 : el.clientWidth * 0.8,
      behavior: "smooth",
    })
  }

  const arrowBtn =
    "grid place-content-center rounded-full p-2 shadow transition-colors " +
    "bg-ui-bg-base/90 hover:bg-ui-bg-base/60 focus:outline-none"

  return (
    <div>
      {/* heading + arrows */}
      <div className="-mt-10 md:mt-0 mb-6 flex items-center justify-between">
        <LocalizedClientLink
          href={`/collections/${collectionHandle}`}
          className="font-semibold text-white hover:underline focus:underline focus:outline-none"
        >
          <span className="sm:hidden text-3xl">Shop Vapes</span>
          <span className="hidden sm:inline text-4xl">{title}</span>
        </LocalizedClientLink>

        {/* arrows (desktop only) */}
        <div className="hidden sm:flex gap-3">
          <button aria-label="Scroll left" onClick={() => scroll("left")} className={arrowBtn}>
            <ChevronLeft className="h-8 w-8 text-ui-fg-base bg-white rounded-full" />
          </button>
          <button aria-label="Scroll right" onClick={() => scroll("right")} className={arrowBtn}>
            <ChevronRight className="h-8 w-8 text-ui-fg-base bg-white rounded-full" />
          </button>
        </div>

        {/* mobile “view more” */}
        <LocalizedClientLink
          href={`/collections/${collectionHandle}`}
          className="sm:hidden text-sm font-semibold text-lime-500 mt-4"
        >
          View More
        </LocalizedClientLink>
      </div>

      {/* product rail */}
      <ul ref={listRef} className="flex gap-6 overflow-x-auto snap-x scroll-smooth no-scrollbar">
        {products.map((p) => {
          /* cast first variant to any so TS allows .prices */
          const cheapest = (p.variants?.[0] as any)?.prices?.[0]

          return (
            <li
              key={p.id}
              className="
                snap-start shrink-0 w-[clamp(16rem,80vw,20rem)]
                rounded-2xl bg-transparent overflow-hidden
              "
            >
              {/* image link */}
              <LocalizedClientLink
                href={`/products/${p.handle}`}
                className="block aspect-[4/4.2] relative cursor-pointer"
              >
                <Image
                  src={p.thumbnail ?? "/placeholder.png"}
                  alt={p.title}
                  fill
                  sizes="(max-width:640px) 80vw, 320px"
                  className="object-cover object-center rounded-2xl"
                  priority
                />
              </LocalizedClientLink>

              <div className="p-4 flex flex-col gap-1">
                {/* title link */}
                <LocalizedClientLink
                  href={`/products/${p.handle}`}
                  className="line-clamp-2 text-lg font-semibold text-white hover:text-lime-400"
                >
                  {p.title}
                </LocalizedClientLink>

                {cheapest && (
                  <span className="text-lg font-bold text-lime-500">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: cheapest.currency_code.toUpperCase(),
                    }).format(cheapest.amount / 100)}
                  </span>
                )}

                {/* view details link */}
                <LocalizedClientLink
                  href={`/products/${p.handle}`}
                  className="mt-2 inline-block text-sm font-semibold text-lime-500 hover:text-lime-600"
                >
                  View&nbsp;Details →
                </LocalizedClientLink>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
