import MentomBase from "../core/mentom-base"
import { PaymentProviderKeys } from "../types"

/**
 * Concrete provider class instantiated by Medusa.
 * All logic lives in MentomBase.
 */
class MentomProviderService extends MentomBase {
  static identifier = PaymentProviderKeys.MENTOM
  constructor(container, options) {
    console.log("[MENTOM_PLUGIN] MentomProviderService constructor called. Options received:", options);
    super(container, options)
    console.log("[MENTOM_PLUGIN] MentomProviderService super(container, options) called.");
  }
}

export default MentomProviderService
