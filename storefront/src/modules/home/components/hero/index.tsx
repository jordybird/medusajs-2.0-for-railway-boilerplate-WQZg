import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getCategoryByHandle } from "@lib/data/categories"
import { HttpTypes } from "@medusajs/types"

// ─── Config ────────────────────────────────────────────────────────────────
const FEATURED_HANDLES = ["nicotine", "delta8-hemp"] as const // shown on both desktop & mobile
const MOBILE_ONLY_HANDLES = ["electronics", "accessories"] as const // extra cards for mobile only
const ALL_HANDLES = [...FEATURED_HANDLES, ...MOBILE_ONLY_HANDLES] as const

const HERO_IMAGES = {
  nicotine: "/nicotine-hero.png",
  "delta8-hemp": "/rolling-hero.jpg",
} as const

const HERO_ICONS = {
  nicotine: "/vape.png",
  "delta8-hemp": "/cannabis.png",
  electronics: "/electronics.png",
  accessories: "/accessories.png",
} as const

interface FeaturedCat extends HttpTypes.StoreProductCategory {
  metadata?: { hero_image?: string }
}

// ─── Component ──────────────────────────────────────────────────────────────
export default async function Hero() {
  const { product_categories } = await getCategoryByHandle(
    ALL_HANDLES as unknown as string[],
  )

  const cats = (product_categories || []) as FeaturedCat[]
  const [left, right] = FEATURED_HANDLES.map((h) =>
    cats.find((c) => c.handle === h),
  ) as (FeaturedCat | undefined)[]
  const mobileExtras = MOBILE_ONLY_HANDLES.map((h) =>
    cats.find((c) => c.handle === h),
  ) as (FeaturedCat | undefined)[]

  /* desktop‑only hero image */
  const DesktopImg = ({
    handle,
    cat,
  }: {
    handle: keyof typeof HERO_IMAGES
    cat?: FeaturedCat
  }) => (
    <Image
      fill
      priority
      sizes="60vw"
      className="object-cover object-center rounded-r-2xl"
      src={cat?.metadata?.hero_image ?? HERO_IMAGES[handle]}
      alt={cat?.name ?? handle}
    />
  )

  /* reusable mobile card */
  const MobileCard = ({
    handle,
    href,
    title,
    subtitle,
  }: {
    handle: keyof typeof HERO_ICONS
    href: string
    title: string
    subtitle: string
  }) => (
    <LocalizedClientLink
      href={href}
      className="
        md:hidden snap-start shrink-0
        w-64 h-24 rounded-2xl border-2 border-gray-700
        flex items-center gap-3 pl-4 pr-3
        hover:shadow-md transition-shadow
      
        w-64 h-24 rounded-2xl border-2 border-gray-700
        flex items-center gap-3 pl-4 pr-3
        hover:shadow-md transition-shadow
      "
    >
      <div className="flex-none bg-white rounded-full p-2">
        <Image src={HERO_ICONS[handle]} alt="" width={40} height={40} />
      </div>

      <div className="flex flex-col">
        <span className="text-lg font-semibold text-white">{title}</span>
        <span className="text-sm text-white">{subtitle}</span>
      </div>
    </LocalizedClientLink>
  )

  return (
    <section className="content-container pt-0 -mt-6 md:mt-0 md:pt-2 pb-2 font-sans">
      {/* mobile hint */}
      <p className="md:hidden text-xs text-white/80 mb-2 pl-1">Browse our categories</p>

      <div
        className="
          flex gap-4 overflow-x-auto snap-x scroll-smooth no-scrollbar
          md:grid md:grid-cols-3 md:gap-6 md:overflow-visible
        "
      >
        {/* ───── LEFT (Nicotine) ───── */}
        {left && (
          <div
            className="
              relative shrink-0
              w-64 h-24 md:w-auto md:h-[500px]
              md:col-span-2 md:grid md:grid-cols-[40%_60%]
              rounded-2xl overflow-hidden
              bg-transparent md:bg-[#E8FAD7]
            "
          >
            <MobileCard
              handle="nicotine"
              href={`/categories/${left.handle}`}
              title={left.name}
              subtitle="Ready for a new flavor?"
            />

            {/* desktop text */}
            <div className="hidden md:flex flex-col justify-center gap-4 p-6">
              <h1 className="text-4xl text-[#222222] font-bold">{left.name}</h1>
              <p className="text-lg text-ui-fg-subtle">
                Ready for a new flavor? Discover your next go‑to vape.
              </p>
              <LocalizedClientLink
                href={`/categories/${left.handle}`}
                className="inline-block w-max px-6 py-2 bg-ui-fg-base text-white font-semibold rounded-full hover:bg-ui-fg-subtle transition-colors shadow-md hover:shadow-lg"
              >
                Vapes
              </LocalizedClientLink>
            </div>

            <div className="hidden md:block relative h-full w-full">
              <DesktopImg handle="nicotine" cat={left} />
            </div>
            <LocalizedClientLink
              href={`/categories/${left.handle}`}
              aria-label={left.name}
              className="hidden md:block absolute inset-0 z-20"
            />
          </div>
        )}

        {/* ───── RIGHT (Delta‑8) ───── */}
        {right && (
          <div
            className="
              relative shrink-0
              w-64 h-24 md:w-auto md:h-[500px]
              md:col-span-1 rounded-2xl overflow-hidden
            "
          >
            <MobileCard
              handle="delta8-hemp"
              href={`/categories/${right.handle}`}
              title="Delta 8"
              subtitle="Get tailored offers."
            />

            {/* desktop hero */}
            <div className="hidden md:block relative h-full w-full">
              <DesktopImg handle="delta8-hemp" cat={right} />
              <div className="absolute inset-0 bg-black/40 pointer-events-none" />
              <div className="absolute bottom-4 left-4 text-white drop-shadow-lg z-10">
                <h2 className="text-2xl font-semibold">{right.name}</h2>
                <span className="text-base">Shop&nbsp;Now</span>
              </div>
              <LocalizedClientLink
                href={`/categories/${right.handle}`}
                aria-label={right.name}
                className="absolute inset-0 z-20"
              />
            </div>
          </div>
        )}

        {/* ───── MOBILE‑ONLY EXTRAS ───── */}
        {mobileExtras.map(
          (cat, idx) =>
            cat && (
              <MobileCard
                key={cat.id ?? MOBILE_ONLY_HANDLES[idx]}
                handle={MOBILE_ONLY_HANDLES[idx] as keyof typeof HERO_ICONS}
                href={`/categories/${cat.handle}`}
                title={cat.name}
                subtitle={
                  cat.handle === "electronics"
                    ? "Power your puff."
                    : "Complete your setup."
                }
              />
            ),
        )}
      </div>
    </section>
  )
}
