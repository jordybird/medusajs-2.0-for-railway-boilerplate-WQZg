import { Disclosure } from "@headlessui/react"
import { Badge, Button, clx } from "@medusajs/ui"
import { useEffect } from "react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { useFormStatus } from "react-dom"

type AccountInfoProps = {
  label: string
  currentInfo: string | React.ReactNode
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  clearState: () => void
  children?: React.ReactNode
  actionLabel?: string                  // ✨ NEW
  onAction?: () => void                 // ✨ NEW
  "data-testid"?: string
}

const AccountInfo = ({
  label,
  currentInfo,
  isSuccess,
  isError,
  clearState,
  errorMessage = "An error occurred, please try again",
  children,
  actionLabel = "Edit",
  onAction,
  "data-testid": dataTestid,
}: AccountInfoProps) => {
  const { state, close, toggle } = useToggleState()
  const { pending } = useFormStatus()

  const handleToggle = () => {
    clearState()
    setTimeout(() => toggle(), 100)
  }

  useEffect(() => {
    if (isSuccess) close()
  }, [isSuccess, close])

  return (
    <div className="text-small-regular" data-testid={dataTestid}>
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="uppercase text-ui-fg-base">{label}</span>
          <div className="flex items-center flex-1 basis-0 justify-end gap-x-4">
            {typeof currentInfo === "string" ? (
              <span className="font-semibold" data-testid="current-info">
                {currentInfo}
              </span>
            ) : (
              currentInfo
            )}
          </div>
        </div>

        {/* ── Action button ── */}
        <Button
          variant="secondary"
          className="w-[100px] min-h-[25px] py-1"
          onClick={onAction ?? handleToggle}
          type={state ? "reset" : "button"}
          data-testid="edit-button"
        >
          {state ? "Cancel" : actionLabel}
        </Button>
      </div>

      {/* success / error panels unchanged … */}
      {/* (keep the rest of the component exactly as before) */}
      {/* ... */}
    </div>
  )
}

export default AccountInfo
