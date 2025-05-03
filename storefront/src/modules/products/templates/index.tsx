/* storefront/src/modules/products/templates/index.tsx
   – white title is handled by ProductInfo above
   – only the Shipping & Returns accordion remains
*/

import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import ProductInfo from "@modules/products/templates/product-info"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"

/* a tiny one-off accordion for Shipping & Returns */
const ShippingAccordion = () => (
  <details className="border-t border-gray-600 pt-4 text-sm">
    <summary className="cursor-pointer select-none text-gray-300">
      Shipping &amp; Returns
    </summary>
    <div className="pt-3 text-gray-400">
      Orders ship within 24 h. Returns accepted within 30 days on unopened
      items. See our full policy at checkout.
    </div>
  </details>
)

/* thumbnail rail (same as before) */
const ThumbRail = ({ images }: { images: HttpTypes.StoreProductImage[] }) => (
  <nav className="hidden small:flex flex-col gap-2 sticky top-32">
    {images.map((img) => (
      <a
        key={img.id}
        href={`#${img.id}`}
        className="block w-20 h-20 relative overflow-hidden rounded
                   ring-1 ring-transparent hover:ring-lime-500 transition"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      </a>
    ))}
  </nav>
)

type Props = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<Props> = ({ product, region, countryCode }) => {
  if (!product?.id) return null

  return (
    <>
      {/* ─────────── Product body ─────────── */}
      <div className="content-container grid grid-cols-1 small:grid-cols-12 gap-x-8 py-6">
        <div className="small:col-span-2">
          <ThumbRail images={product.images || []} />
        </div>

        <div className="small:col-span-6">
          <ImageGallery images={product.images || []} />
        </div>

        {/* Buy-box – dark panel */}
        <aside
          className="small:col-span-4 flex flex-col gap-y-8 sticky top-32
                     bg-[#222222] text-white rounded-lg p-6"
        >
          <ProductInfo product={product} />
          <ProductOnboardingCta />

          <Suspense
            fallback={
              <ProductActions disabled product={product} region={region} />
            }
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>

          {/* Only shipping accordion shown */}
          <ShippingAccordion />
        </aside>
      </div>

      {/* Related products (unchanged) */}
      <div className="content-container my-16 small:my-32">
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
