/* SERVER component: fetch nicotine collection + products */

import { getCollectionByHandle } from "@lib/data/collections"
import { getProductsList } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import NicotineRail from "./Rail.client"

interface Props {
  countryCode: string
}

export default async function NicotineShowcase({ countryCode }: Props) {
  const collection = await getCollectionByHandle("nicotine")
  if (!collection?.id) return null

  const { response } = await getProductsList({
    queryParams: { collection_id: collection.id } as any,
    countryCode,
  })

  const products = response.products as HttpTypes.StoreProduct[]
  if (!products?.length) return null

  return (
    <section className="content-container py-14">
      <NicotineRail
        products={products}
        collectionHandle={collection.handle}
        title="Shop Our Best-Selling Vapes"
      />
    </section>
  )
}
