/**
 *  BlueCheck Webhook  –  POST /webhooks/bluecheck
 *  ------------------------------------------------
 *  • Verifies   x-bluecheck-signature   header using HMAC-SHA256
 *  • Accepts only   verification.status === "Approved"
 *  • Sets customer.metadata.identity_verified = true
 *
 *  ENV VARS required in backend:
 *      BLUECHECK_WEBHOOK_SECRET   your 32-char string
 */

import crypto from "crypto";
import { Router } from "express";

const SECRET = process.env.BLUECHECK_WEBHOOK_SECRET!;
if (!SECRET) throw new Error("BLUECHECK_WEBHOOK_SECRET not set");

export default (app, container) => {
  const router = Router();

  /**
   * ── helper: constant-time compare two hex strings
   */
  const secureCompare = (a: string, b: string) => {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");
    return (
      bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)
    );
  };

  /**
   *  POST  /webhooks/bluecheck
   */
  router.post(
    "/bluecheck",
    // keep raw body so the HMAC matches BlueCheck’s signature
    require("express").raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["x-bluecheck-signature"] as string | undefined;
      if (!sig) return res.status(400).send("Missing signature");

      /* ── 1. verify HMAC ─────────────────────────────── */
      const expected = crypto
        .createHmac("sha256", SECRET)
        .update(req.body)                  // raw Buffer
        .digest("hex");

      if (!secureCompare(expected, sig))
        return res.status(400).send("Bad signature");

      /* ── 2. parse the trusted payload ───────────────── */
      let event: any;
      try {
        event = JSON.parse(req.body.toString());
      } catch {
        return res.status(400).send("Invalid JSON");
      }

      const status = event.verification?.status;        // "Approved", "Failed"…
      const customerId = event.external_id;             // we sent as external_id

      if (status === "Approved" && customerId) {
        const customerService: any = container.resolve("customerService");
        await customerService.update(customerId, {
          metadata: { identity_verified: true, bluecheck_uuid: event.uuid },
        });
      }

      return res.sendStatus(200);
    }
  );

  /* final path →  /webhooks/bluecheck */
  app.use("/webhooks", router);
};
