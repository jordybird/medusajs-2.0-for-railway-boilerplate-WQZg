import { sdk } from "@lib/config"
import { cache } from "react"
import { getProductsList } from "./products"
import { HttpTypes } from "@medusajs/types"

export const retrieveCollection = cache(async function (id: string) {
  return sdk.store.collection
    .retrieve(id, {}, { next: { tags: ["collections"] } })
    .then(({ collection }) => collection)
})

export const getCollectionsList = cache(async function (
  offset: number = 0,
  limit: number = 100
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> {
  return sdk.store.collection
    .list({ limit, offset: 0 }, { next: { tags: ["collections"] } })
    .then(({ collections }) => ({ collections, count: collections.length }))
})

export const getCollectionByHandle = cache(async function (
  handle: string
): Promise<HttpTypes.StoreCollection> {
  return sdk.store.collection
    .list({ handle }, { next: { tags: ["collections"] } })
    .then(({ collections }) => collections[0])
})

export const getCollectionsWithProducts = cache(
  async (countryCode: string): Promise<HttpTypes.StoreCollection[] | null> => {
    const { collections } = await getCollectionsList(0, 3)
    if (!collections) return null

    const collectionIds = collections
      .map((c) => c.id)
      .filter(Boolean) as string[]

    /* 👉  cast queryParams to “any” so TS stops complaining about collection_id */
    const { response } = await getProductsList({
      queryParams: { collection_id: collectionIds } as any,
      countryCode,
    })

    response.products.forEach((product) => {
      const parent = collections.find((c) => c.id === product.collection_id)
      if (!parent) return
      if (!parent.products) parent.products = []
      parent.products.push(product as any)
    })

    return collections as unknown as HttpTypes.StoreCollection[]
  }
)
