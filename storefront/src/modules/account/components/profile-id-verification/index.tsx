"use client"

import { HttpTypes } from "@medusajs/types"
import AccountInfo from "../account-info"

type Props = { customer: HttpTypes.StoreCustomer }

export default function ProfileIDVerification({ customer }: Props) {
  const isVerified = customer.metadata?.identity_verified === true

  function startPersona() {
    console.log("ID-verify button clicked") // 👉 visible in browser devtools

    const tmpl = process.env.NEXT_PUBLIC_PERSONA_VERIFICATION_TEMPLATE_ID!
    const env  = process.env.NEXT_PUBLIC_PERSONA_ENV_ID  // may be undefined in prod
    const ref  = customer.id
    const redirect = encodeURIComponent(
      `${window.location.origin}/account/profile`
    )

    const url =
      "https://inquiry.withpersona.com/inquiry" +
      `?verification-template-id=${tmpl}` +
      (env ? `&environment-id=${env}` : "") +
      `&reference-id=${ref}` +
      `&redirect-uri=${redirect}`

    window.location.assign(url)
  }

  return (
    <AccountInfo
      label="ID verification"
      currentInfo={isVerified ? "Verified" : "Not verified"}
      isSuccess={isVerified}
      isError={false}
      clearState={() => null}
      actionLabel={isVerified ? "Edit" : "Add"}  // 👈 changes “Edit” → “Add”
      onAction={isVerified ? undefined : startPersona}
    />
  )
}
