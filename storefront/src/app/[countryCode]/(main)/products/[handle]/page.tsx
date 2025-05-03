/* storefront/src/app/[countryCode]/(main)/products/[handle]/page.tsx */

import Script from "next/script"
import { Metadata } from "next"
import { notFound } from "next/navigation"

import ProductTemplate from "@modules/products/templates"
import { getRegion, listRegions } from "@lib/data/regions"
import { getProductByHandle, getProductsList } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

type Params = { countryCode: string; handle: string }

/* ---------- static params ------------------------------------------------- */
export async function generateStaticParams() {
  const countryCodes = (await listRegions())
    .flatMap(r => r.countries?.map(c => c.iso_2) ?? [])
    .filter((cc): cc is string => Boolean(cc))

  const products = await Promise.all(
    countryCodes.map(cc => getProductsList({ countryCode: cc }))
  ).then(r => r.flatMap(({ response }) => response.products))

  return countryCodes.flatMap(cc =>
    products.map(p => ({ countryCode: cc, handle: p.handle }))
  )
}

/* ---------- metadata ------------------------------------------------------ */
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const region = await getRegion(params.countryCode)
  if (!region) notFound()

  const product = await getProductByHandle(params.handle, region.id)
  if (!product) notFound()

  return {
    title: `${product.title} | Higher Up Smoke Shop`,
    description: product.description ?? product.title,
    openGraph: {
      title: `${product.title} | Higher Up Smoke Shop`,
      description: product.description ?? product.title,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

/* ---------- JSON-LD builder ---------------------------------------------- */
function buildProductSchema(
  p: HttpTypes.StoreProduct,
  currencyCode: string            // pass region.currency_code in
) {
  /* unique images without Set<> (ES5-safe) */
  const images = (p.images?.map(i => i.url) ?? []).filter(
    (url, idx, arr) => arr.indexOf(url) === idx
  )

  /* grab lowest explicit price, or fall back to calculated_price */
  const prices = (p.variants ?? []).flatMap((v: any) => v.prices ?? [])
  const explicit = prices.sort((a, b) => a.amount - b.amount)[0]

  const fallbackPrice =
    p.variants?.[0]?.calculated_price !== undefined
      ? { amount: p.variants[0].calculated_price, currency_code: currencyCode }
      : undefined

  const priceObj = explicit ?? fallbackPrice

  const offers = priceObj && {
    "@type": "Offer",
    url: `https://higherupsmoke.shop/products/${p.handle}`,
    priceCurrency: priceObj.currency_code.toUpperCase(),
    price: (priceObj.amount / 100).toFixed(2),
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.description ?? "",
    sku: p.id,
    image: images,
    ...(offers && { offers }),        // now always present
  }
}

/* ---------- page component ------------------------------------------------ */
export default async function ProductPage({ params }: { params: Params }) {
  const region = await getRegion(params.countryCode)
  if (!region) notFound()

  const product = await getProductByHandle(params.handle, region.id)
  if (!product) notFound()

  return (
    <>
      <Script
        id="ld-json-product"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildProductSchema(product, region.currency_code)),
        }}
      />

      <ProductTemplate
        product={product}
        region={region}
        countryCode={params.countryCode}
      />
    </>
  )
}
