import MentomProviderService from "modules/providers/payment-mentom/src/services/mentom-provider"
import { ModuleProvider, Modules } from "@medusajs/framework/utils"

/**
 * Expose the Mentom provider to Medusa’s payment module.
 */
export default ModuleProvider(Modules.PAYMENT, {
  services: [MentomProviderService],
})
