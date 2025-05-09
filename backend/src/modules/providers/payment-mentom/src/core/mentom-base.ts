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
    if (!isDefined(o.apiKey)) throw new Error("Mentom provider: apiKey missing")
    if (!isDefined(o.terminalId)) throw new Error("Mentom provider: terminalId missing")
  }

  constructor(container: Record<string, unknown>, options: MentomOptions) {
    // @ts-ignore  Medusa DI signature
    super(...arguments)

    this.options_ = options
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
