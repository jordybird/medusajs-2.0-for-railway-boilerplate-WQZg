// lib/bluecheck.ts
export async function createPhotoIdOrder(payload: object) {
    const res = await fetch(
      `${process.env.BLUECHECK_HOST}/v1/verification`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.BLUECHECK_TOKEN}`,   // <- prefix matters
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        // It’s a one-shot call; no need to revalidate.
        next: { revalidate: 0 },
      }
    );
  
    if (!res.ok) {
      throw new Error(`BlueCheck ${res.status}: ${await res.text()}`);
    }
  
    return res.json() as Promise<{
      uuid: string;
      public_url: string;
    }>;
  }
  