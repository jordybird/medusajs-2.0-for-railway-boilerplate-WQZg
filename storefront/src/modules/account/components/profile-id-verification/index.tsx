"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import AccountInfo from "../account-info"

type Props = { customer: HttpTypes.StoreCustomer }

export default function ProfileIDVerification({ customer }: Props) {
  // flag you write into customer.metadata in the webhook handler
  const isVerified = customer.metadata?.identity_verified === true

  const [launching, setLaunching] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  function startPersona() {
    const template = process.env.NEXT_PUBLIC_PERSONA_TEMPLATE_ID!
    const env      = process.env.NEXT_PUBLIC_PERSONA_ENV_ID!
    const ref      = customer.id                                 // 🔑 ties result → user
    const redirect = encodeURIComponent(
      `${window.location.origin}/account/profile`
    )
  
    const link =
      `https://withpersona.com/verify` +
      `?inquiry-template-id=${template}` +
      `&environment-id=${env}` +
      `&reference-id=${ref}` +
      `&redirect-uri=${redirect}`      // persona will bounce back here
  
    window.location.href = link        // 🚀 off to the hosted form
  }
  

  return (
    <AccountInfo
      label="ID verification"
      currentInfo={isVerified ? "Verified" : "Not verified"}
      isSuccess={isVerified}
      isError={!!error}
      clearState={() => setError(null)}
    >
      {isVerified ? null : (
        <button
          type="button"
          disabled={launching}
          onClick={startPersona}
          className="
            self-start px-4 py-2 rounded
            bg-ui-fg-base text-white
            hover:bg-ui-fg-subtle disabled:opacity-50
          "
        >
          {launching ? "Launching…" : "Verify with Persona"}
        </button>
      )}

      {error && (
        <p className="text-ui-danger mt-2">{error}</p>
      )}
    </AccountInfo>
  )
}
