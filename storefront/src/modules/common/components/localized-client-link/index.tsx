"use client"

import Link from "next/link"
import React from "react"

/**
 * US-only storefront:
 * Always prefixes links with “/us” and ignores whatever
 * dynamic country code might have been in the URL params.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: React.PropsWithChildren<{
  href: string
  className?: string
  onClick?: () => void
  passHref?: true
  [key: string]: any
}>) => {
  const prefix = "/us"

  // ensure we don’t end up with “//” if someone passes a leading slash
  const path = href.startsWith("/") ? href : `/${href}`

  return (
    <Link href={`${prefix}${path}`} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
