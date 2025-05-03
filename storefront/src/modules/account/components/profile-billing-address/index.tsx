"use client"

import { useEffect, useMemo, useState } from "react"
import { useFormState } from "react-dom"

import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import AccountInfo from "../account-info"

import { updateCustomerAddress } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"

type Props = {
  customer: HttpTypes.StoreCustomer
  regions: HttpTypes.StoreRegion[]
}

export default function ProfileBillingAddress({ customer, regions }: Props) {
  /* country select options */
  const opts = useMemo(
    () =>
      regions.flatMap((r) =>
        r.countries?.map((c) => ({ value: c.iso_2, label: c.display_name }))
      ),
    [regions]
  )

  const billing = customer.addresses?.find((a) => a.is_default_billing) ?? null

  /* form state */
  const [state, action] = useFormState(updateCustomerAddress, {
    success: false,
    error: null as string | null,
  })
  const [tick, setTick] = useState(false)

  useEffect(() => {
    if (state.success) {
      setTick(true)
      const t = setTimeout(() => setTick(false), 1800)
      return () => clearTimeout(t)
    }
  }, [state.success])

  /* current address string */
  const info = useMemo(() => {
    if (!billing) return "No billing address"

    const country =
      opts.find((o) => o && o.value === billing.country_code)?.label ??
      billing.country_code?.toUpperCase()

    return (
      <div className="flex flex-col font-semibold">
        <span>
          {billing.first_name} {billing.last_name}
        </span>
        {billing.company && <span>{billing.company}</span>}
        <span>
          {billing.address_1}
          {billing.address_2 ? `, ${billing.address_2}` : ""}
        </span>
        <span>
          {billing.postal_code}, {billing.city}
        </span>
        <span>{country}</span>
      </div>
    )
  }, [billing, opts])

  /* --------------------------------------------------------------- */
  return (
    <form action={action} className="w-full">
      <input type="hidden" name="address_id" value={billing?.id ?? ""} />

      <AccountInfo
        label="Billing address"
        currentInfo={info}
        isSuccess={tick}
        isError={!!state.error}
        clearState={() => setTick(false)}
      >
        <div className="grid grid-cols-1 gap-y-2">
          <div className="grid grid-cols-2 gap-x-2">
            <Input
              label="First name"
              name="billing_address.first_name"
              defaultValue={billing?.first_name ?? ""}
              required
            />
            <Input
              label="Last name"
              name="billing_address.last_name"
              defaultValue={billing?.last_name ?? ""}
              required
            />
          </div>

          <Input
            label="Company"
            name="billing_address.company"
            defaultValue={billing?.company ?? ""}
          />

          <Input
            label="Address"
            name="billing_address.address_1"
            defaultValue={billing?.address_1 ?? ""}
            required
          />
          <Input
            label="Apartment, suite, etc."
            name="billing_address.address_2"
            defaultValue={billing?.address_2 ?? ""}
          />

          <div className="grid grid-cols-[144px_1fr] gap-x-2">
            <Input
              label="Postal code"
              name="billing_address.postal_code"
              defaultValue={billing?.postal_code ?? ""}
              required
            />
            <Input
              label="City"
              name="billing_address.city"
              defaultValue={billing?.city ?? ""}
              required
            />
          </div>

          <Input
            label="Province"
            name="billing_address.province"
            defaultValue={billing?.province ?? ""}
          />

          <NativeSelect
            name="billing_address.country_code"
            defaultValue={billing?.country_code ?? ""}
            required
          >
            <option value="">-</option>
            {opts.map(
              (o) =>
                o && (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                )
            )}
          </NativeSelect>
        </div>
      </AccountInfo>
    </form>
  )
}
