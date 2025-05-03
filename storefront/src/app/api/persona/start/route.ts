// storefront/src/app/api/persona/start/route.ts
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"   // disable Next.js route caching

/* ========= 1.  Load required ENV vars  ========= */
const {
  PERSONA_TEMPLATE_ID,
  PERSONA_ENV_ID,
  PERSONA_SECRET_KEY,
} = process.env

if (!PERSONA_TEMPLATE_ID || !PERSONA_ENV_ID || !PERSONA_SECRET_KEY) {
  // Fail fast at boot if any var is missing
  throw new Error(
    "Missing Persona env vars. Check .env.local for " +
      "PERSONA_TEMPLATE_ID, PERSONA_ENV_ID, PERSONA_SECRET_KEY."
  )
}

/* ========= 2.  POST handler  ========= */
export async function POST(req: NextRequest) {
  try {
    const { customerId } = await req.json()

    if (!customerId || typeof customerId !== "string") {
      return NextResponse.json(
        { error: "customerId (string) is required" },
        { status: 400 }
      )
    }

    /* ---- 2a.  Create inquiry via Persona REST API ---- */
    const r = await fetch("https://api.withpersona.com/inquiry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PERSONA_SECRET_KEY}`,
        "Persona-Version": "2023-01-15",
      },
      body: JSON.stringify({
        templateId: PERSONA_TEMPLATE_ID,
        environmentId: PERSONA_ENV_ID, // env_xxx   (sandbox)
        referenceId: customerId,       // ties inquiry ⇆ user
      }),
    })

    if (!r.ok) {
      const detail = await r.text()
      console.error("Persona API error →", detail)
      return NextResponse.json(
        { error: "Persona API error", detail },
        { status: 502 }
      )
    }

    const { data } = await r.json() // Persona wraps payload in { data: { id … } }
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
