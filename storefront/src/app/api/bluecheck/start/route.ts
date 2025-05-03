// storefront/src/app/api/bluecheck/start/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // ensure no edge caching

/* ── 1  Env vars ──────────────────────────────────────────────── */
const {
  BLUECHECK_TOKEN,                          // Bearer token from Integration
  BLUECHECK_API   = "https://api.bluecheck.me",
  BACKEND_URL,                              // public URL of your Medusa backend
} = process.env;

if (!BLUECHECK_TOKEN || !BACKEND_URL) {
  throw new Error(
    "Missing env vars: set BLUECHECK_TOKEN and BACKEND_URL in .env.local"
  );
}

/* ── 2  POST /api/bluecheck/start ─────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    /* 2a  Validate input --------------------------------------- */
    const { customerId, email } = await req.json();

    if (typeof customerId !== "string" || !customerId) {
      return NextResponse.json(
        { error: "customerId (string) is required" },
        { status: 400 }
      );
    }

    /* 2b  Create verification order on BlueCheck --------------- */
    const bc = await fetch(`${BLUECHECK_API}/v1/verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BLUECHECK_TOKEN}`,
      },
      body: JSON.stringify({
        external_id: customerId,                      // echoed in the webhook
        notification_url: `${BACKEND_URL}/webhooks/bluecheck`,
        data: { email },                              // optional pre-fill
        config: { max_attempts: 3, checkups: ["dob"] }
      }),
    });

    if (!bc.ok) {
      const detail = await bc.text();
      console.error("BlueCheck API error →", detail);
      return NextResponse.json(
        { error: "BlueCheck API error", detail },
        { status: 502 }
      );
    }

    const { verification_order } = await bc.json();   // { public_url, uuid }

    /* 2c  Return link to the browser --------------------------- */
    return NextResponse.json({ link: verification_order.public_url });

  } catch (err: any) {
    console.error("BlueCheck start route failed →", err);
    return NextResponse.json(
      { error: err?.message ?? "internal server error" },
      { status: 500 }
    );
  }
}
