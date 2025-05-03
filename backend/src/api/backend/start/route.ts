// storefront/src/app/api/bluecheck/start/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // disable route caching

/* ── 1.  Load env vars ────────────────────────────────────────────── */
const {
  BLUECHECK_TOKEN,          // Bearer token from the Integration screen
  BLUECHECK_API = "https://api.bluecheck.me",   // default base URL
  BACKEND_URL,              // e.g. https://api.higherupsmoke.shop  (for webhooks)
} = process.env;

if (!BLUECHECK_TOKEN || !BACKEND_URL) {
  throw new Error(
    "Missing env vars: make sure BLUECHECK_TOKEN and BACKEND_URL are set."
  );
}

/* ── 2.  POST handler ─────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const { customerId, email } = await req.json();

    if (!customerId || typeof customerId !== "string") {
      return NextResponse.json(
        { error: "customerId (string) is required" },
        { status: 400 }
      );
    }

    /* 2a.  Create verification order on BlueCheck */
    const resp = await fetch(`${BLUECHECK_API}/verify/photo-id`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BLUECHECK_TOKEN}`,
      },
      body: JSON.stringify({
        external_id: customerId,                            // comes back in webhook
        notification_url: `${BACKEND_URL}/webhooks/bluecheck`,
        data: { email },                                   // optional prefill
        config: { max_attempts: 3, checkups: ["dob"] },    // DOB match
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      console.error("BlueCheck API error →", detail);
      return NextResponse.json(
        { error: "BlueCheck API error", detail },
        { status: 502 }
      );
    }

    const { verification_order } = await resp.json();      // { public_url, uuid }
    return NextResponse.json({ link: verification_order.public_url });
  } catch (err: any) {
    console.error("Route failure →", err);
    return NextResponse.json(
      { error: err?.message ?? "internal server error" },
      { status: 500 }
    );
  }
}
