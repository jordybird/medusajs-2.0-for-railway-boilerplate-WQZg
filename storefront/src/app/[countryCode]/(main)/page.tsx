import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import NicotineShowcase from "@modules/home/components/nicotine"
import Delta from "@modules/home/components/delta"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Higher Up Smoke Shop",
  description:
    "Shop your favorite vapes, and hemp products online or at our various locations. ",
}

export default async function Home({
  params: { countryCode },
}: {
  params: { countryCode: string }
}) {
  const collections = await getCollectionsWithProducts(countryCode)
  const region = await getRegion(countryCode)

  if (!collections || !region) return null

  return (
    <>
      {/* hero banner */}
      <div className="py-12">
        <Hero />
      </div>

      {/* nicotine collection rail */}
      <NicotineShowcase countryCode={countryCode} />
      <Delta countryCode={countryCode} />

      {/* existing featured products */}
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}
