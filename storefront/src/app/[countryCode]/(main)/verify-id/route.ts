/* storefront/src/app/[countryCode]/(main)/verify-id/route.ts
   ------------------------------------------------------------------
   • Creates a BlueCheck photo-ID order with real customer data
   • return_url  →  <BASE_URL>/<cc>/<return_to>
   • webhook     →  <BACKEND_URL>/webhooks/bluecheck
*/
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getCustomer } from "@lib/data/customer"

const BC_HOST   = process.env.BLUECHECK_HOST  ?? "https://customer-api.bluecheck.me"
const BC_TOKEN  = process.env.BLUECHECK_TOKEN!
const BASE_URL  = process.env.NEXT_PUBLIC_BASE_URL ?? ""          // e.g. https://storefront-production-….up.railway.app
const BACKEND   = process.env.BACKEND_URL          ?? "http://localhost:9000" // public backend URL

/* helper: call BlueCheck --------------------------------------------------- */
async function createOrder(body: Record<string, unknown>) {
  const res = await fetch(`${BC_HOST}/v1/verification`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${BC_TOKEN}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`BlueCheck ${res.status}: ${await res.text()}`)
  return (await res.json()).verification_order as { public_url: string }
}

/* GET /us/verify-id?return_to=/account/profile ----------------------------- */
export async function GET(
  req: NextRequest,
  { params }: { params: { countryCode: string } }
) {
  const frontOrigin = BASE_URL || req.nextUrl.origin          // dev ⇒ http://localhost:8000

  try {
    /* 1️⃣  current customer */
    const customer = await getCustomer().catch(() => null)

    /* 2️⃣  build return path  (/us/account/profile) */
    const raw  = new URL(req.url).searchParams.get("return_to") ?? "/checkout"
    const path = raw.startsWith("/") ? raw : `/${raw}`
    const returnURL = `${frontOrigin}/${params.countryCode}${path}`

    /* 3️⃣  payload */
    const payload: Record<string, any> = {
      external_id: customer?.id ?? crypto.randomUUID(),
      return_url:       returnURL,
      notification_url: `${BACKEND}/webhooks/bluecheck`,
      type: "photo_id",
    }

    if (customer) {
      payload.data = {
        first_name:    customer.first_name,
        last_name:     customer.last_name,
        email:         customer.email,
        phone: customer.phone ? `+1${customer.phone.replace(/[^0-9]/g, "")}` : undefined,
        date_of_birth: typeof customer.metadata?.dob === "string"
          ? customer.metadata.dob.slice(0, 10)
          : undefined,
      }
    }

    /* 4️⃣  create order → redirect */
    const { public_url } = await createOrder(payload)
    return NextResponse.redirect(public_url, 302)
  } catch (err) {
    console.error("[verify-id] failed:", err)
    return NextResponse.redirect(`${frontOrigin}/checkout?bc_error=1`, 302)
  }
}
