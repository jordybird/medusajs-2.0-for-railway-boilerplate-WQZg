/* storefront/src/modules/products/components/product-actions/index.tsx
   – Dark-theme friendly (no hard-coded colors)
   – Variant selectors rendered as <select> dropdowns
*/

"use client"

import { Button } from "@medusajs/ui"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { useIntersection } from "@lib/hooks/use-in-view"
import Divider from "@modules/common/components/divider"
import MobileActions from "./mobile-actions"
import ProductPrice from "../product-price"
import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

/* ---------- helpers ------------------------------------------------------ */
const optionsAsKeymap = (variantOptions: any) =>
  variantOptions?.reduce(
    (acc: Record<string, string | undefined>, varopt: any) => {
      if (varopt.option && varopt.value != null) {
        acc[varopt.option.title] = varopt.value
      }
      return acc
    },
    {}
  )

/* ====================================================================== */
/*                               component                                */
/* ====================================================================== */
export default function ProductActions({
  product,
  region,
  disabled,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useParams().countryCode as string

  /* ----- pre-select if only one variant -------------------------------- */
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  /* ----- currently selected variant ------------------------------------ */
  const selectedVariant = useMemo(() => {
    if (!product.variants?.length) return undefined
    return product.variants.find((v) =>
      isEqual(optionsAsKeymap(v.options), options)
    )
  }, [product.variants, options])

  /* ----- change handler ------------------------------------------------- */
  const setOptionValue = (title: string, value: string) =>
    setOptions((prev) => ({ ...prev, [title]: value }))

  /* ----- stock availability -------------------------------------------- */
  const inStock = useMemo(() => {
    if (!selectedVariant) return false
    if (!selectedVariant.manage_inventory) return true
    if (selectedVariant.allow_backorder) return true
    return (selectedVariant.inventory_quantity || 0) > 0
  }, [selectedVariant])

  /* ----- sticky / mobile actions --------------------------------------- */
  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")

  /* ----- add-to-cart ---------------------------------------------------- */
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return
    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
    })

    setIsAdding(false)
  }

  /* =================================================================== */
  /*                                JSX                                 */
  /* =================================================================== */
  return (
    <>
      <div ref={actionsRef} className="flex flex-col gap-y-4">
        {/* ---------- variant dropdowns ---------- */}
        {(product.options || []).length > 0 && (
          <>
            {(product.options || []).map((opt) => (
              <div key={opt.id} className="flex flex-col gap-y-1">
                <label className="text-sm font-medium">
                  {opt.title ?? "Option"}
                </label>

                <select
                  value={options[opt.title ?? ""] ?? ""}
                  onChange={(e) => setOptionValue(opt.title ?? "", e.target.value)}
                  disabled={!!disabled || isAdding}
                  className="
                    w-full h-10 rounded-md border border-gray-600 bg-[#222222]
                    px-3 text-sm outline-none
                    disabled:opacity-50
                  "
                >
                  <option value="" disabled>
                    Select {opt.title?.toLowerCase()}
                  </option>
                  {(opt.values || []).map((val) => (
                    <option key={val.id} value={val.value}>
                      {val.value}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <Divider />
          </>
        )}

        {/* ---------- price ---------- */}
        <ProductPrice product={product} variant={selectedVariant} />

        {/* ---------- add-to-cart ---------- */}
        <Button
          onClick={handleAddToCart}
          disabled={!inStock || !selectedVariant || !!disabled || isAdding}
          variant="primary"
          className="w-full h-10"
          isLoading={isAdding}
        >
          {!selectedVariant
            ? "Select variant"
            : !inStock
            ? "Out of stock"
            : "Add to cart"}
        </Button>

        {/* ---------- mobile slide-up ---------- */}
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
