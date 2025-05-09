import axios from "axios";
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import type { MentomOptions } from "../../../modules/providers/payment-mentom/src/types"; // Corrected relative import path
console.log("[MENTOM_ROUTE] /api/store/mentom-hosted-form/route.ts file loaded by Medusa.");

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  console.log("[MENTOM_ROUTE_MINIMAL] POST /api/store/mentom-hosted-form handler called (minimal test).");
  try {
    res.status(200).json({ message: "Minimal handler reached successfully" });
  } catch (error) {
    console.error("[MENTOM_ROUTE_MINIMAL] Error in minimal handler:", error.message);
    res.status(500).json({ message: "Error in minimal handler." });
  }
}
