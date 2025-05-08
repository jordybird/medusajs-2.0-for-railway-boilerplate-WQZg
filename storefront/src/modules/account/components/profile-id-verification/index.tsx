/* storefront/src/modules/account/components/profile-id-verification/index.tsx */
"use client"

import { usePathname, useRouter } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import AccountInfo   from "../account-info"
import { isIdVerified } from "@lib/util/customer-flags"

type Props = { customer: HttpTypes.StoreCustomer }

export default function ProfileIDVerification({ customer }: Props) {
  const router    = useRouter()
  const pathname  = usePathname()                  // e.g. /us/account/profile
  const ccPrefix  = pathname.split("/")[1]         // "us" | "de" | …

  const verified  = isIdVerified(customer)

  /** identical flow to cart CTA, returns to /account/profile */
  const startVerify = () => {
    const url =
      `/${ccPrefix}/verify-id?return_to=${encodeURIComponent(`/account/profile`)}`
    router.push(url, { scroll: false })
  }

  /* —— RETURN (unchanged, no country logic here) —— */
  return (
    <AccountInfo
      label="ID verification"
      currentInfo={verified ? "Verified" : "Not verified"}
      isSuccess={verified}
      clearState={() => null}
      actionLabel={verified ? "Edit" : "Add"}
      onAction={verified ? undefined : startVerify}
    />
  )
}
