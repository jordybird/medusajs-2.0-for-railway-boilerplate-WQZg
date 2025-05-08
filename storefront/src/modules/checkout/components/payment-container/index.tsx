import { RadioGroup } from "@headlessui/react"
import { clx } from "@medusajs/ui"
import Radio from "@modules/common/components/radio"

type Props = {
  paymentProviderId: string
  selectedPaymentOptionId: string | null
  paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>
}

const PaymentContainer: React.FC<Props> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
}) => (
  <RadioGroup.Option
    value={paymentProviderId}
    className={clx(
      "flex flex-col gap-y-2 py-4 px-8 mb-2 border rounded-rounded hover:shadow-borders-interactive-with-active cursor-pointer",
      selectedPaymentOptionId === paymentProviderId &&
        "border-ui-border-interactive"
    )}
  >
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-x-4">
        <Radio checked={selectedPaymentOptionId === paymentProviderId} />
        <span>{paymentInfoMap[paymentProviderId]?.title || paymentProviderId}</span>
      </div>
      {paymentInfoMap[paymentProviderId]?.icon}
    </div>
  </RadioGroup.Option>
)

export default PaymentContainer
