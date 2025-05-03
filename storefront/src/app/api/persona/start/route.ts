// storefront/src/app/api/persona/start/route.ts
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic" // disable Next.js route caching

/* ========= 1. Load required ENV vars (new names) ========= */
const {
  NEXT_PUBLIC_PERSONA_VERIFICATION_TEMPLATE_ID: PERSONA_VERIFICATION_TEMPLATE_ID,
  NEXT_PUBLIC_PERSONA_ENV_ID:                 PERSONA_ENV_ID,
  PERSONA_SECRET_KEY,                         // server-side secret
} = process.env

if (!PERSONA_VERIFICATION_TEMPLATE_ID || !PERSONA_ENV_ID || !PERSONA_SECRET_KEY) {
  throw new Error(
    "Missing Persona env vars. Check .env.local for " +
      "NEXT_PUBLIC_PERSONA_VERIFICATION_TEMPLATE_ID, " +
      "NEXT_PUBLIC_PERSONA_ENV_ID, PERSONA_SECRET_KEY."
  )
}

/* ========= 2. POST handler ========= */
export async function POST(req: NextRequest) {
  try {
    const { customerId } = await req.json()

    if (!customerId || typeof customerId !== "string") {
      return NextResponse.json(
        { error: "customerId (string) is required" },
        { status: 400 }
      )
    }

    /* ---- 2a. Create inquiry via Persona REST API ---- */
    const resp = await fetch("https://api.withpersona.com/inquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PERSONA_SECRET_KEY}`,
        "Persona-Version": "2023-01-15",
      },
      body: JSON.stringify({
        verificationTemplateId: PERSONA_VERIFICATION_TEMPLATE_ID,
        environmentId:          PERSONA_ENV_ID,   // env_… (sandbox); omit for prod
        referenceId:            customerId,       // ties inquiry ⇆ user
      }),
    })

    if (!resp.ok) {
      const detail = await resp.text()
      console.error("Persona API error →", detail)
      return NextResponse.json({ error: "Persona API error", detail }, { status: 502 })
    }

    const { data } = await resp.json() // { data: { id: "inq_xxx" } }
    const link = `https://withpersona.com/verify?inquiry-id=${data.id}`

    return NextResponse.json({ link })
  } catch (err: any) {
    console.error("Route failure →", err)
    return NextResponse.json(
      { error: err?.message ?? "internal server error" },
      { status: 500 }
    )
  }
}
