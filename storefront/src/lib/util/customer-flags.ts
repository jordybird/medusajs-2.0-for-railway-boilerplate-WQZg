import { HttpTypes } from "@medusajs/types"

/** true when BlueCheck webhook stamped the flag */
export const isIdVerified = (
  c?: HttpTypes.StoreCustomer | null
): boolean => c?.metadata?.identity_verified === true

/** true when DOB ≥ 21 y (set by webhook) */
export const is21Plus = (
  c?: HttpTypes.StoreCustomer | null
): boolean => c?.metadata?.over_age === true
