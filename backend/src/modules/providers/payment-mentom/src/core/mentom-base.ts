import axios, { AxiosInstance } from "axios"
import crypto from "crypto"
import {
  AbstractPaymentProvider,
  PaymentSessionStatus,
  PaymentActions,
  isDefined,
} from "@medusajs/framework/utils"
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  ProviderWebhookPayload,
  WebhookActionResult,
} from "@medusajs/framework/types"
import { MentomOptions } from "../types"

export default abstract class MentomBase extends AbstractPaymentProvider<MentomOptions> {
  protected client_: AxiosInstance
  protected options_: MentomOptions

  /* ─────────────────────────────────────────── */
  /*  Validation & Axios                         */
  /* ─────────────────────────────────────────── */
  static validateOptions(o: MentomOptions): void {
    console.log("[MENTOM_PLUGIN] MentomBase.validateOptions: Validating options. Stringified:", JSON.stringify(o, null, 2));
    if (!isDefined(o.apiKey) || o.apiKey === "") {
      console.error("[MENTOM_PLUGIN] MentomBase.validateOptions: apiKey is missing or empty.");
      throw new Error("Mentom provider: apiKey missing or empty");
    }
    console.log("[MENTOM_PLUGIN] MentomBase.validateOptions: apiKey check passed.");
    if (!isDefined(o.terminalId)) {
      console.error("[MENTOM_PLUGIN] MentomBase.validateOptions: terminalId is not defined.");
      throw new Error("Mentom provider: terminalId missing");
    }
    if (typeof o.terminalId !== 'number' || isNaN(o.terminalId)) {
       console.error("[MENTOM_PLUGIN] MentomBase.validateOptions: terminalId is not a valid number. Value:", o.terminalId);
       throw new Error("Mentom provider: terminalId is not a valid number.");
    }
    console.log("[MENTOM_PLUGIN] MentomBase.validateOptions: terminalId check passed.");
    console.log("[MENTOM_PLUGIN] MentomBase.validateOptions: All checks passed.");
  }

  constructor(container: Record<string, unknown>, options: MentomOptions) {
    // @ts-ignore  Medusa DI signature
    // Log options IMMEDIATELY upon entry
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log("[MENTOM_PLUGIN] RAW ENTRY MentomBase constructor. Options type:", typeof options);
    try {
      console.log("[MENTOM_PLUGIN] RAW ENTRY MentomBase constructor. Options (stringified):", JSON.stringify(options, null, 2));
    } catch (stringifyError) {
      console.error("[MENTOM_PLUGIN] RAW ENTRY MentomBase constructor. FAILED TO STRINGIFY OPTIONS:", stringifyError.message);
      console.log("[MENTOM_PLUGIN] RAW ENTRY MentomBase constructor. Options (raw inspect):", options); // Fallback log
    }
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

    // @ts-ignore Medusa's DI and AbstractPaymentProvider might expect this pattern
    super(...arguments); // Call to AbstractPaymentProvider constructor
    console.log("[MENTOM_PLUGIN] MentomBase constructor: super() called. Now processing options internally.");
    // this.options_ is typically set by the AbstractPaymentProvider's constructor via super(container, options)
    console.log("[MENTOM_PLUGIN] MentomBase constructor: Internal this.options_ (after super):", JSON.stringify(this.options_, null, 2));
    console.log("[MENTOM_PLUGIN] MentomBase constructor: Argument 'options' (after super):", JSON.stringify(options, null, 2));

    try {
      console.log("[MENTOM_PLUGIN] MentomBase: Attempting to call validateOptions with internal this.options_.");
      MentomBase.validateOptions(this.options_); // Validate this.options_ as set by super()
      console.log("[MENTOM_PLUGIN] MentomBase: this.options_ validated successfully.");
    } catch (e) {
      console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      console.error("[MENTOM_PLUGIN] CRITICAL: MentomBase options validation FAILED (using this.options_):", e.message);
      console.error("[MENTOM_PLUGIN] CRITICAL: Error Stack:", e.stack);
      console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      throw e; // Re-throw to ensure Medusa handles the plugin load failure
    }

    // this.options_ = options; // This line is likely redundant as AbstractPaymentProvider's constructor should set this.options_
    this.client_ = axios.create({
      baseURL: options.baseUrl?.replace(/\/+$/, "") ?? "https://gateway.mentomdashboard.com",
      timeout: 15_000,
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "Content-Type": "application/json",
      },
    })
  }

  /* ─────────────────────────────────────────── */
  /*  Helpers                                    */
  /* ─────────────────────────────────────────── */
  private verifySignature(raw: string | Buffer, header?: string): boolean {
    if (!this.options_.webhookSecret) return true
    const sig = header ?? ""
    try {
      const ev = JSON.parse(raw.toString())
      const base = `${this.options_.webhookSecret}${ev.id}${ev.module}${ev.action}${ev.date}`
      const expected = crypto.createHash("sha512").update(base).digest("hex")
      return sig === expected
    } catch {
      return false
    }
  }

  private toSessionStatus(ch: Record<string, any>): PaymentSessionStatus {
    const s = (ch?.status?.status ?? "").toLowerCase()
    if (s === "approved") {
      return ch.captured ? PaymentSessionStatus.CAPTURED : PaymentSessionStatus.AUTHORIZED
    }
    if (s === "inprogress") return PaymentSessionStatus.PENDING
    if (s === "decline")    return PaymentSessionStatus.CANCELED
    if (s === "error")      return PaymentSessionStatus.ERROR
    return PaymentSessionStatus.PENDING
  }

  /* ─────────────────────────────────────────── */
  /*  Core lifecycle                             */
  /* ─────────────────────────────────────────── */
  async initiatePayment(
    { amount, data, context }: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const rawBody = (data as any).raw_body
    if (!rawBody || typeof rawBody !== "object") {
      throw new Error("Mentom provider: missing payment details in raw_body. Card and IP details are required.")
    }
    const { card, ip, source: src, level: lv, ...rest } = rawBody as Record<string, any>
    if (!card || !card.number || !card.exp || !card.cvv) {
      throw new Error("Mentom provider: missing required card fields (number, exp, cvv)")
    }
    const body = {
      terminal: { id: this.options_.terminalId },
      amount,
      source: src ?? "Internet",
      level: lv ?? 1,
      card,
      ip,
      ...rest,
    }

    const path = this.options_.capture ? "/payment/sale" : "/payment/auth"
    const { data: tx } = await this.client_.post(path, body, {
      headers: { "Idempotency-Key": context?.idempotency_key },
    })

    return { id: tx.id, data: tx }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    return { status: this.toSessionStatus(input.data), data: input.data }
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    const id = input.data?.id as string

    const body: any = { terminal: { id: this.options_.terminalId } }
    // some storefronts may pass an amount on manual captures
    if ("amount" in input && (input as any).amount != null) {
      body.amount = (input as any).amount
    }

    const { data: res } = await this.client_.post(`/payment/${id}/capture`, body)
    return { data: res }
  }

  async refundPayment(
    { data, amount }: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    const id = data?.id as string
    const { data: res } = await this.client_.post(`/payment/${id}/refund`, {
      terminal: { id: this.options_.terminalId },
      amount,
    })
    return { data: res }
  }

  async cancelPayment(
    { data }: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    // Mentom voids via refund with zero body
    const id = data?.id as string
    const { data: res } = await this.client_.post(`/payment/${id}/refund`, {
      terminal: { id: this.options_.terminalId },
    })
    return { data: res }
  }

  async retrievePayment(
    { data }: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    const id = data?.id as string
    const { data: res } = await this.client_.get(`/payment/${id}`)
    return { data: res }
  }

  async getPaymentStatus(
    { data }: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const id = data?.id as string
    const { data: res } = await this.client_.get(`/payment/${id}`)
    return { status: this.toSessionStatus(res), data: res }
  }

  /* Pass-through helpers */
  async deletePayment(i: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return this.cancelPayment(i)
  }
  async updatePayment(i: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return { data: i.data }
  }

  /* ─────────────────────────────────────────── */
  /*  Webhook                                    */
  /* ─────────────────────────────────────────── */
  async getWebhookActionAndData(
    p: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    if (!this.verifySignature(p.rawData as Buffer, p.headers["Webhook-Signature"] as string | undefined)) {
      throw new Error("Mentom webhook signature mismatch")
    }

    const ev = JSON.parse(p.rawData as string)
    if (ev.module !== "payment") return { action: PaymentActions.NOT_SUPPORTED }

    const charge = ev.data
    switch (ev.action) {
      case "capture":
      case "refund":
        return { action: PaymentActions.SUCCESSFUL, data: charge }

      case "updateStatus": {
        const st = this.toSessionStatus(charge)
        const map: Record<PaymentSessionStatus, PaymentActions> = {
          [PaymentSessionStatus.CAPTURED]:     PaymentActions.SUCCESSFUL,
          [PaymentSessionStatus.AUTHORIZED]:   PaymentActions.AUTHORIZED,
          [PaymentSessionStatus.CANCELED]:     PaymentActions.CANCELED,
          [PaymentSessionStatus.ERROR]:        PaymentActions.FAILED,
          [PaymentSessionStatus.PENDING]:      PaymentActions.PENDING,
          [PaymentSessionStatus.REQUIRES_MORE]:PaymentActions.REQUIRES_MORE,
        }
        return { action: map[st], data: charge }
      }

      default:
        return { action: PaymentActions.NOT_SUPPORTED }
    }
  }
}
