/* storefront/src/app/[countryCode]/(main)/verify-id/route.ts
   ------------------------------------------------------------------
   Builds a BlueCheck “photo_id” order and sends the shopper to the
   hosted page.  The webhook URL now points at the **backend** (port 9000
   in dev, your BACKEND_URL in prod) so the verification result
   actually reaches the Medusa server.
*/
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getCustomer } from "@lib/data/customer"

const BC_HOST  = process.env.BLUECHECK_HOST  ?? "https://customer-api.bluecheck.me"
const BC_TOKEN = process.env.BLUECHECK_TOKEN!
const BACKEND  = process.env.BACKEND_URL     ?? "http://localhost:9000" // <-- NEW

async function createPhotoIdOrder(body: Record<string, unknown>) {
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

export async function GET(req: NextRequest) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    `${req.nextUrl.protocol}//${req.nextUrl.host}` // dev → http://localhost:8000

  try {
    /* 1️⃣  logged-in customer (may be null) */
    const customer = await getCustomer().catch(() => null)

    /* 2️⃣  where BlueCheck should send shopper back */
    const rawReturn =
      new URL(req.url).searchParams.get("return_to") ?? "/checkout"
    const returnPath = rawReturn.startsWith("/") ? rawReturn : `/${rawReturn}`

    /* 3️⃣  build payload */
    const payload: Record<string, any> = {
      external_id: customer?.id ?? crypto.randomUUID(),
      return_url:       `${origin}${returnPath}`,
      notification_url: `${BACKEND}/webhooks/bluecheck`,   // <-- CHANGED
      type: "photo_id",
    }

    if (customer) {
      payload.data = {
        first_name:    customer.first_name,
        last_name:     customer.last_name,
        email:         customer.email,
        phone: customer.phone
          ? `+1${customer.phone.replace(/[^0-9]/g, "")}`
          : undefined,
        date_of_birth: typeof customer.metadata?.dob === "string"
          ? customer.metadata.dob.slice(0, 10)
          : undefined,
      }
    }

    /* 4️⃣  create order & redirect to hosted page */
    const { public_url } = await createPhotoIdOrder(payload)
    return NextResponse.redirect(public_url, 302)
  } catch (err) {
    console.error("[verify-id] failed:", err)
    return NextResponse.redirect(`${origin}/checkout?bc_error=1`, 302)
  }
}
