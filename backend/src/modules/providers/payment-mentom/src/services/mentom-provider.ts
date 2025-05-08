import MentomBase from "../core/mentom-base"
import { PaymentProviderKeys } from "../types"

/**
 * Concrete provider class instantiated by Medusa.
 * All logic lives in MentomBase.
 */
class MentomProviderService extends MentomBase {
  static identifier = PaymentProviderKeys.MENTOM
  constructor(container, options) {
    super(container, options)
  }
}

export default MentomProviderService
