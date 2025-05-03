/* ───────────────────────────────────────────────────────────────
   Customer data helpers (TS-strict safe)
   ──────────────────────────────────────────────────────────── */
   "use server"

   import { sdk } from "@lib/config"
   import medusaError from "@lib/util/medusa-error"
   import { HttpTypes } from "@medusajs/types"
   import { revalidateTag } from "next/cache"
   import { redirect } from "next/navigation"
   import { cache } from "react"
   import { getAuthHeaders, removeAuthToken, setAuthToken } from "./cookies"
   
   /* helper: toss nulls → undefined */
   const stripNull = <T extends Record<string, unknown>>(o: T) =>
     Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null)) as
       Partial<T>
   
   /* ------------------------------------------------------------------ */
   /* 1 ▸ cached current customer                                        */
   export const getCustomer = cache(async () => {
     return sdk.store.customer
       .retrieve({}, { next: { tags: ["customer"] }, ...getAuthHeaders() })
       .then(({ customer }) => customer)
       .catch(() => null)
   })
   
   /* ------------------------------------------------------------------ */
   /* 2 ▸ updateCustomer (merges metadata)                               */
   type Updatable = Partial<
     Pick<HttpTypes.StoreCustomer, "first_name" | "last_name" | "email" | "phone">
   > & { metadata?: Record<string, unknown> }
   
   export async function updateCustomer(patch: Updatable) {
     const current = await getCustomer()
     if (!current) throw new Error("Not authenticated")
   
     const body = {
       ...stripNull(patch),
       metadata: { ...(current.metadata ?? {}), ...(patch.metadata ?? {}) },
     } as HttpTypes.StoreUpdateCustomer
   
     try {
       const { customer } = await sdk.store.customer.update(
         body,
         {},
         getAuthHeaders()
       )
       revalidateTag("customer")
       return customer
     } catch (e) {
       throw medusaError(e)
     }
   }
   
   /* ------------------------------------------------------------------ */
   /* 3 ▸ signup                                                         */
   export async function signup(_: unknown, fd: FormData) {
     const pw = fd.get("password") as string
     const form = {
       email: fd.get("email") as string,
       first_name: fd.get("first_name") as string,
       last_name: fd.get("last_name") as string,
       phone: fd.get("phone") as string,
     }
   
     try {
       const tmp = await sdk.auth.register("customer", "emailpass", {
         email: form.email,
         password: pw,
       })
   
       const { customer } = await sdk.store.customer.create(
         form,
         {},
         { authorization: `Bearer ${tmp}` } // ClientHeaders = record
       )
   
       const tok = await sdk.auth.login("customer", "emailpass", {
         email: form.email,
         password: pw,
       })
       setAuthToken(typeof tok === "string" ? tok : tok.location)
   
       revalidateTag("customer")
       return customer
     } catch (e: any) {
       return e.toString()
     }
   }
   
   /* ------------------------------------------------------------------ */
   /* 4 ▸ login / logout                                                 */
   export async function login(_: unknown, fd: FormData) {
     const email = fd.get("email") as string
     const pw = fd.get("password") as string
   
     try {
       const tok = await sdk.auth.login("customer", "emailpass", { email, password: pw })
       setAuthToken(typeof tok === "string" ? tok : tok.location)
       revalidateTag("customer")
     } catch (e: any) {
       return e.toString()
     }
   }
   
   export async function signout(cc: string) {
     await sdk.auth.logout()
     removeAuthToken()
     revalidateTag("auth")
     revalidateTag("customer")
     redirect(`/${cc}/account`)
   }
   
   /* ------------------------------------------------------------------ */
   /* 5 ▸ generic helpers                                                */
   const objFromForm = (fd: FormData) =>
     Object.fromEntries(fd) as Record<string, string>
   
   /* add address */
   export async function addCustomerAddress(_: unknown, fd: FormData) {
     try {
       await sdk.store.customer.createAddress(objFromForm(fd), {}, getAuthHeaders())
       revalidateTag("customer")
       return { success: true, error: null }
     } catch (e: any) {
       return { success: false, error: e.toString() }
     }
   }
   
   /* delete address */
   export async function deleteCustomerAddress(id: string) {
     try {
       await sdk.store.customer.deleteAddress(id, getAuthHeaders())
       revalidateTag("customer")
       return { success: true, error: null }
     } catch (e: any) {
       return { success: false, error: e.toString() }
     }
   }
   
   /* ------------------------------------------------------------------ */
   /* 6 ▸ updateCustomerAddress – create OR update                       */
   export async function updateCustomerAddress(_: unknown, fd: FormData) {
     const id = (fd.get("address_id") as string | null) ?? undefined
   
     /* strip billing_address. prefix into a clean payload */
     const addr: Record<string, string> = {}
     fd.forEach((v, k) => {
       if (k.startsWith("billing_address.")) {
         addr[k.replace("billing_address.", "")] = v as string
       }
     })
   
     try {
       if (id) {
         /* update existing address */
         await sdk.store.customer.updateAddress(id, addr, {}, getAuthHeaders())
       } else {
         /* first-time add – mark default billing */
         await sdk.store.customer.createAddress(
           { ...addr, is_default_billing: true },
           {},
           getAuthHeaders()
         )
       }
   
       revalidateTag("customer")
       return { success: true, error: null }
     } catch (e: any) {
       return { success: false, error: e.toString() }
     }
   }
   