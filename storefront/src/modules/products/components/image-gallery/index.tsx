/* storefront/src/modules/products/components/image-gallery/index.tsx */

"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { Container } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"

type Props = {
  images: HttpTypes.StoreProductImage[]
  thumbnail?: string
}

/** Local, relaxed image shape (id + url required; anything else optional) */
type GalleryImage = Pick<HttpTypes.StoreProductImage, "id" | "url"> &
  Partial<Omit<HttpTypes.StoreProductImage, "id" | "url">>

export default function ImageGallery({ images, thumbnail }: Props) {
  /* fallback to thumbnail if API returned no gallery images */
  const gallery: GalleryImage[] =
    images.length > 0
      ? images
      : thumbnail
      ? [{ id: "thumb", url: thumbnail }]
      : []

  if (gallery.length === 0) return null

  const [activeIdx, setActiveIdx] = useState(0)
  const active = gallery[activeIdx]

  /* arrow-key navigation */
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setActiveIdx((i) => (i + 1) % gallery.length)
      if (e.key === "ArrowLeft") setActiveIdx((i) => (i - 1 + gallery.length) % gallery.length)
    },
    [gallery.length],
  )

  useEffect(() => {
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onKey])

  return (
    <div className="flex flex-col items-center gap-y-4">
      {/* main image */}
      <Container className="relative aspect-[29/34] w-full overflow-hidden bg-grey-80 dark:bg-grey-20 rounded-rounded">
        <Image
          src={active.url}
          alt="Product image"
          fill
          priority
          sizes="
            (max-width: 576px) 280px,
            (max-width: 768px) 360px,
            (max-width: 992px) 480px,
            800px
          "
          className="object-cover"
        />
      </Container>

      {/* thumbnail row (mobile) */}
      <nav className="small:hidden flex w-full gap-2 overflow-x-auto pb-2 no-scrollbar">
        {gallery.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setActiveIdx(idx)}
            className="
              relative flex-shrink-0 w-20 h-20 rounded
              ring-2 ring-transparent
              focus:outline-none focus:ring-lime-500
              aria-selected:ring-lime-500
            "
            aria-selected={idx === activeIdx}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover rounded"
            />
          </button>
        ))}
      </nav>
    </div>
  )
}
