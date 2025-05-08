/**
 * BlueCheck Webhook – POST /webhooks/bluecheck
 * • Verifies X-BlueCheck-Signature (HMAC-SHA256)
 * • Accepts only verification.status === "approved"
 * • Writes   identity_verified   and   over_age   flags to customer.metadata
 *
 * ENV:
 *   BLUECHECK_WEBHOOK_SECRET   shared secret from BlueCheck
 */

import crypto from "crypto"
import { Router } from "express"

const SECRET = process.env.BLUECHECK_WEBHOOK_SECRET!
if (!SECRET) throw new Error("BLUECHECK_WEBHOOK_SECRET not set")

export default (app, container) => {
  const router = Router()

  /** constant-time hex compare */
  const secureCompare = (a: string, b: string) => {
    const bufA = Buffer.from(a, "hex")
    const bufB = Buffer.from(b, "hex")
    return (
      bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)
    )
  }

  /** age ≥ 21 helper */
  const is21 = (dobIso?: string) => {
    if (!dobIso) return false
    const dob = new Date(dobIso)
    const now = new Date()
    let age = now.getUTCFullYear() - dob.getUTCFullYear()
    if (now < new Date(now.getUTCFullYear(), dob.getUTCMonth(), dob.getUTCDate()))
      age--
    return age >= 21
  }

  router.post(
    "/bluecheck",
    require("express").raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["x-bluecheck-signature"] as string | undefined
      if (!sig) return res.status(400).send("Missing signature")

      /* 1  verify HMAC */
      const expected = crypto
        .createHmac("sha256", SECRET)
        .update(req.body) // raw Buffer
        .digest("hex")

      if (!secureCompare(expected, sig))
        return res.status(400).send("Bad signature")

      /* 2  parse payload */
      let event: any
      try {
        event = JSON.parse(req.body.toString())
      } catch {
        return res.status(400).send("Invalid JSON")
      }

      const { verification = {}, external_id: customerId } = event
      const status  = verification.status                // "approved"
      const dobIso  = verification?.data?.date_of_birth  // "YYYY-MM-DD"

      if (status === "approved" && customerId) {
        const customerService: any = container.resolve("customerService")
        await customerService.update(customerId, {
          metadata: {
            identity_verified: true,
            over_age:         is21(dobIso),
            bluecheck_dob:    dobIso,
            bluecheck_uuid:   event.uuid,
          },
        })
      }

      return res.sendStatus(200)
    }
  )

  app.use("/webhooks", router) // final path → /webhooks/bluecheck
}
