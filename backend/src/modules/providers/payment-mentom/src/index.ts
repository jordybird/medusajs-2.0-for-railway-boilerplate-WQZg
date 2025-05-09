console.log("[MENTOM_PLUGIN_INDEX] TOP LEVEL: backend/src/modules/providers/payment-mentom/src/index.ts is being executed by Node.js");
import MentomProviderService from "./services/mentom-provider";
console.log("[MENTOM_PLUGIN_INDEX] MentomProviderService imported.");

// The main module export for Medusa.
// Medusa typically looks for a 'services' array.
const mentomModule = {
  services: [MentomProviderService],
};

console.log("[MENTOM_PLUGIN_INDEX] Exporting Mentom module:", mentomModule);
export default mentomModule;
