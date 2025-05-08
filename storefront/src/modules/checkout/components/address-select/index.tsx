/* --------------------------------------------------------------------------
 *  storefront/src/modules/checkout/components/addresses/AddressSelect.tsx
 *  Align dropdown shade exactly with the checkout card
 *  • light: bg-white  / hover:bg-gray-50  (unchanged)
 *  • dark:  bg-[#0d0d0d] / hover:bg-[#141414] – matches card container
 * -------------------------------------------------------------------------- */

import { Listbox, Transition } from "@headlessui/react"
import { ChevronUpDown } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { Fragment, useMemo } from "react"

import Radio from "@modules/common/components/radio"
import compareAddresses from "@lib/util/compare-addresses"
import { HttpTypes } from "@medusajs/types"

interface AddressSelectProps {
  addresses: HttpTypes.StoreCustomerAddress[]
  addressInput: HttpTypes.StoreCartAddress | null
  onSelect: (address: HttpTypes.StoreCartAddress | undefined, email?: string) => void
}

export default function AddressSelect({
  addresses,
  addressInput,
  onSelect,
}: AddressSelectProps) {
  const handleSelect = (id: string) => {
    const saved = addresses.find((a) => a.id === id)
    if (saved) onSelect(saved as HttpTypes.StoreCartAddress)
  }

  const selected = useMemo(() => {
    return addresses.find((a) => compareAddresses(a, addressInput))
  }, [addresses, addressInput])

  return (
    <Listbox onChange={handleSelect} value={selected?.id}>
      <div className="relative">
        <Listbox.Button
          className="relative w-full flex justify-between items-center px-4 py-[10px] text-left bg-background text-foreground border rounded-rounded cursor-default focus:outline-none"
          data-testid="shipping-address-select"
        >
          {({ open }) => (
            <>
              <span className="block truncate">
                {selected ? selected.address_1 : "Choose an address"}
              </span>
              <ChevronUpDown
                className={clx("transition-transform duration-200", {
                  "rotate-180": open,
                })}
              />
            </>
          )}
        </Listbox.Button>

        {/* Dropdown */}
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options
            className="absolute z-20 w-full overflow-auto text-small-regular bg-white dark:bg-[#0d0d0d] border border-t-0 border-ui-border-subtle max-h-60 focus:outline-none sm:text-sm"
            data-testid="shipping-address-options"
          >
            {addresses.map((address) => (
              <Listbox.Option
                key={address.id}
                value={address.id}
                className="cursor-pointer select-none relative pl-6 pr-10 py-4 hover:bg-gray-50 dark:hover:bg-[#141414]"
                data-testid="shipping-address-option"
              >
                <div className="flex gap-x-4 items-start">
                  <Radio checked={selected?.id === address.id} data-testid="shipping-address-radio" />
                  <div className="flex flex-col">
                    <span className="text-left text-base-semi">
                      {address.first_name} {address.last_name}
                    </span>
                    {address.company && (
                      <span className="text-small-regular text-ui-fg-subtle">
                        {address.company}
                      </span>
                    )}
                    <div className="flex flex-col text-left text-base-regular mt-2">
                      <span>
                        {address.address_1}
                        {address.address_2 && <span>, {address.address_2}</span>}
                      </span>
                      <span>
                        {address.postal_code}, {address.city}
                      </span>
                      <span>
                        {address.province && `${address.province}, `}
                        {address.country_code?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}