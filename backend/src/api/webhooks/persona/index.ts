/**
 *  Persona webhook – inquiry.completed
 *  -----------------------------------
 *  Mounted as        POST /webhooks/persona
 *
 *  • Uses express.raw() so the HMAC matches the exact bytes Persona signed
 *  • Verifies persona-signature header (v1) with HMAC-SHA256
 *  • Updates the Medusa customer whose id == referenceId
 *
 *  Env vars required:
 *      PERSONA_WEBHOOK_SECRET = wbhsec_...
 */

import express, { Router, Request, Response } from "express"
import crypto from "crypto"

const WEBHOOK_SECRET = process.env.PERSONA_WEBHOOK_SECRET
if (!WEBHOOK_SECRET) {
  throw new Error("PERSONA_WEBHOOK_SECRET env var not set")
}

export default (app, container) => {
  const router = Router()

  /**
   * Helper – constant-time compare two hex strings
   */
  const safeEqual = (a: string, b: string) => {
    const buffA = Buffer.from(a, "hex")
    const buffB = Buffer.from(b, "hex")
    return (
      buffA.length === buffB.length &&
      crypto.timingSafeEqual(buffA, buffB)
    )
  }

  /**
   * POST /webhooks/persona
   */
  router.post(
    "/persona",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      /* ─── 1. Verify signature ───────────────────────────── */
      const sig = req.headers["persona-signature"] as string | undefined
      if (!sig) return res.status(400).send("Missing signature header")

      // header looks like:  t=1717557904, v1=abcdef1234...
      const parts = Object.fromEntries(
        sig.split(",").map((p) => p.trim().split("="))
      ) as { t?: string; v1?: string }

      if (!parts.t || !parts.v1)
        return res.status(400).send("Malformed signature header")

      const expected = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(`${parts.t}.${req.body}`)
        .digest("hex")

      if (!safeEqual(expected, parts.v1))
        return res.status(400).send("Invalid signature")

      /* ─── 2. Parse the JSON now that it’s trusted ───────── */
      let event: any
      try {
        event = JSON.parse(req.body as unknown as string)
      } catch {
        return res.status(400).send("Invalid JSON")
      }

      if (event.type !== "inquiry.completed") return res.sendStatus(200)

      const referenceId = event?.data?.attributes?.referenceId
      if (!referenceId)
        return res.status(400).send("Missing referenceId in payload")

      /* ─── 3. Update customer metadata ───────────────────── */
      const customerService: any = container.resolve("customerService")
      await customerService.update(referenceId, {
        metadata: { identity_verified: true },
      })

      return res.sendStatus(200)
    }
  )

  /* Mount router → final path is  /webhooks/persona  */
  app.use("/webhooks", router)
}
