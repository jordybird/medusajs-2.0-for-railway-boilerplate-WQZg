"use client"

import { useCallback, useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { RadioGroup } from "@headlessui/react"
import { CheckCircleSolid } from "@medusajs/icons"
import { Button, Heading, Text, clx } from "@medusajs/ui"

import Divider from "@modules/common/components/divider"
import PaymentContainer from "@modules/checkout/components/payment-container"
import { initiatePaymentSession } from "@lib/data/cart"
import { isMentom, isManual, paymentInfoMap } from "@lib/constants"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (s: any) => s.status === "pending"
  )
  const [selected, setSelected] = useState(activeSession?.provider_id ?? "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const isOpen = searchParams.get("step") === "payment"

  const paymentReady =
    Boolean(activeSession) || isManual(selected) || isMentom(selected)

  /* helpers ----------------------------------------------------------- */
  const qs = useCallback(
    (k: string, v: string) => {
      const p = new URLSearchParams(searchParams)
      p.set(k, v)
      return p.toString()
    },
    [searchParams]
  )

  const goNext = () =>
    router.push(pathname + "?" + qs("step", "review"), { scroll: false })

  /* submit ------------------------------------------------------------ */
  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (isMentom(selected)) {
        // Handle Mentom Hosted Form redirection
        const response = await fetch("/api/store/mentom-hosted-form", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: cart.total, // Use cart total as amount
            externalId: cart.id, // Use cart ID as externalId
            returnUrl: `${window.location.origin}/${cart.region.country_code}/checkout/mentom-return`, // Placeholder return URL
            // Add any other required Hosted Form parameters here
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to generate Hosted Form URL");
        }

        const { url } = await response.json();
        if (url) {
          window.location.href = url; // Redirect to Mentom Hosted Form
        } else {
          throw new Error("Hosted Form URL not received.");
        }

      } else {
        // Existing logic for other payment providers
        if (!activeSession) {
          await initiatePaymentSession(cart, { provider_id: selected });
        }
        goNext();
      }
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  /* UI ---------------------------------------------------------------- */
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex gap-x-2 text-3xl-regular items-baseline",
            !isOpen && !paymentReady && "opacity-50 select-none pointer-events-none"
          )}
        >
          Payment
          {!isOpen && paymentReady && <CheckCircleSolid />}
        </Heading>

        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={() =>
                router.push(pathname + "?" + qs("step", "payment"), {
                  scroll: false,
                })
              }
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
            >
              Edit
            </button>
          </Text>
        )}
      </div>

      {/* STEP OPEN ----------------------------------------------------- */}
      {isOpen && (
        <>
          <RadioGroup value={selected} onChange={setSelected}>
            {availablePaymentMethods
              .sort((a, b) => (a.provider_id > b.provider_id ? 1 : -1))
              .map((m) => (
                <PaymentContainer
                  key={m.id}
                  paymentProviderId={m.id}
                  selectedPaymentOptionId={selected}
                  paymentInfoMap={paymentInfoMap}
                />
              ))}
          </RadioGroup>

          {error && (
            <p className="text-rose-600 text-small-regular mt-2">{error}</p>
          )}

          <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            disabled={!selected}
            isLoading={isLoading}
          >
            Continue to review
          </Button>
        </>
      )}

      {/* STEP CLOSED --------------------------------------------------- */}
      {!isOpen && paymentReady && (
        <div className="flex flex-col w-1/3">
          <Text className="txt-medium-plus text-ui-fg-base mb-1">
            Payment method
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {paymentInfoMap[selected]?.title || selected}
          </Text>
        </div>
      )}

      <Divider className="mt-8" />
    </div>
  )
}

export default Payment
