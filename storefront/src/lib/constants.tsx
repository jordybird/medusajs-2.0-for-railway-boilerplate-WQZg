/**
 * storefront/src/lib/constants.tsx
 * -------------------------------------------------------------
 * Central payment-provider helpers for the storefront.
 * Mentom is the **only active gateway**.  Stripe & Pay-Pal
 * entries are left for legacy orders / admin screens.
 * -------------------------------------------------------------
 */

import React from "react"
import { CreditCard } from "@medusajs/icons"

import Ideal from "@modules/common/icons/ideal"
import Bancontact from "@modules/common/icons/bancontact"
import PayPal from "@modules/common/icons/paypal"

/* ------------------------------------------------------------------ */
/* 1 ▸ UI metadata for each provider-id                               */
/* ------------------------------------------------------------------ */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  /** ──────  ACTIVE  ────── */
  mentom: {
    title: "Credit Card",
    icon: <CreditCard />,
  },

  /** ──────  Legacy / optional (unused at checkout)  ────── */
  pp_stripe_stripe: {
    title: "Credit Card (Stripe)",
    icon: <CreditCard />,
  },
  "pp_stripe-ideal_stripe": {
    title: "iDEAL",
    icon: <Ideal />,
  },
  "pp_stripe-bancontact_stripe": {
    title: "Bancontact",
    icon: <Bancontact />,
  },
  pp_paypal_paypal: {
    title: "PayPal",
    icon: <PayPal />,
  },
  pp_system_default: {
    title: "Manual Payment",
    icon: <CreditCard />,
  },
}

/* ------------------------------------------------------------------ */
/* 2 ▸ Tiny helpers used across checkout                              */
/* ------------------------------------------------------------------ */
export const isMentom = (id?: string) => id === "mentom"
export const isStripe = (id?: string) => id?.startsWith("pp_stripe_")
export const isPaypal = (id?: string) => id?.startsWith("pp_paypal")
export const isManual = (id?: string) => id?.startsWith("pp_system_default")

/* ------------------------------------------------------------------ */
/* 3 ▸ Currencies that are **not** minor-unit (no ÷100)               */
/* ------------------------------------------------------------------ */
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]
