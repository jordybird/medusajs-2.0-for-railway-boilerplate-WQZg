export interface MentomOptions {
    /**
     * Secret API key issued by Mentom.
     */
    apiKey: string
    /**
     * Your gateway / dashboard terminal ID.
     */
    terminalId: number | string
    /**
     * Set true to run `/payment/sale` (auth + capture) instead of
     * `/payment/auth` → `/capture`.
     */
    capture?: boolean
    /**
     * Override for sandbox host.
     * Default → https://gateway.mentomdashboard.com
     */
    baseUrl?: string
    /**
     * Webhook signing secret (optional but recommended).
     */
    webhookSecret?: string
  }
  
  export const PaymentProviderKeys = {
    MENTOM: "mentom",
  } as const
  