// Removed import for MedusaRequest, MedusaResponse as it was causing issues.
// We'll use untyped req, res for now for the minimal diagnostic handlers.
console.log("[MENTOM_ROUTE] /api/store/mentom-hosted-form/route.ts file loaded by Medusa.");

export const POST = async (req, res) => {
  console.log("[MENTOM_ROUTE_MINIMAL] POST /api/store/mentom-hosted-form handler called (minimal test).");
  try {
    res.status(200).json({ message: "Minimal POST handler reached successfully" });
  } catch (error) {
    console.error("[MENTOM_ROUTE_MINIMAL] Error in minimal POST handler:", error.message);
    res.status(500).json({ message: "Error in minimal POST handler." });
  }
}

export const GET = async (req, res) => {
  console.log("[MENTOM_ROUTE_MINIMAL] GET /api/store/mentom-hosted-form handler called (minimal test).");
  try {
    res.status(200).json({ message: "Minimal GET handler reached successfully" });
  } catch (error) {
    console.error("[MENTOM_ROUTE_MINIMAL] Error in minimal GET handler:", error.message);
    res.status(500).json({ message: "Error in minimal GET handler." });
  }
}
