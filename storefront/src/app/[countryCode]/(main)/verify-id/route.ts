import { NextRequest, NextResponse } from 'next/server';

/** Helper: create the BlueCheck Photo-ID order */
async function createPhotoIdOrder(body: Record<string, unknown>) {
  const res = await fetch(
    `${process.env.BLUECHECK_HOST ?? 'https://customer-api.bluecheck.me'}/v1/verification`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.BLUECHECK_TOKEN}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    throw new Error(`BlueCheck ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<{ uuid: string; public_url: string }>;
}

/* ------------------------------------------------------------------ */
/*  /us/verify-id?return_to=/checkout?step=address  → 302 to BlueCheck */
/* ------------------------------------------------------------------ */
export async function GET(
  req: NextRequest,
  { params }: { params: { countryCode: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const rawReturn = searchParams.get('return_to') ?? '/checkout';

    // Ensure the path starts with the locale prefix
    const localeReturnPath = rawReturn.startsWith('/')
      ? `/${params.countryCode}${rawReturn}`
      : `/${params.countryCode}/${rawReturn}`;

    const siteOrigin =
      process.env.NEXT_PUBLIC_SITE_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    const order = await createPhotoIdOrder({
      external_id: crypto.randomUUID(),
      return_url: `${siteOrigin}${localeReturnPath}`,         // 👈 absolute, locale-aware
      notification_url: `${siteOrigin}/api/bluecheck/webhook`,
      type: 'photo_id',
      data: {
        // TODO: populate with the real customer e-mail + DOB, etc.
        email: 'demo@example.com',
      },
    });

    return NextResponse.redirect(order.public_url, 302);
  } catch (err) {
    console.error('[verify-id] failed:', err);
    const fallback = new URL(
      `/${params.countryCode}/checkout?step=address&bc_error=1`,
      req.nextUrl.origin
    );
    return NextResponse.redirect(fallback, 302);
  }
}
