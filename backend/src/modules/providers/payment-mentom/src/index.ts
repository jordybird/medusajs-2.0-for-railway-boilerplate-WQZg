import MentomProviderService from "./services/mentom-provider"
import { ModuleProvider, Modules } from "@medusajs/framework/utils"

/**
 * Expose Mentom provider to Medusa’s payment module.
 */
export default ModuleProvider(Modules.PAYMENT, {
  services: [MentomProviderService],
})
