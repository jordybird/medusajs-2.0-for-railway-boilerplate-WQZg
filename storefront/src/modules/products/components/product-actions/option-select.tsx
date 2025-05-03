import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  disabled,
  "data-testid": dataTestId,
}) => {
  const values = option.values?.map((v) => v.value) || []

  return (
    <div className="flex flex-col gap-y-3 text-white">
      <span className="text-sm">Select {title}</span>

      {/* Scrollable list */}
      <div
        className="max-h-48 overflow-y-auto flex flex-col gap-y-2 pr-1"
        data-testid={dataTestId}
      >
        {values.map((v) => (
          <button
            key={v}
            disabled={disabled}
            onClick={() => updateOption(option.title ?? "", v ?? "")}
            data-testid="option-button"
            className={clx(
              "w-full text-left rounded-md px-3 py-2",
              "bg-[#222222] text-white border transition-colors",
              {
                "border-white": v === current,
                "border-white/30 hover:border-white/60":
                  v !== current && !disabled,
                "opacity-50 cursor-not-allowed": disabled,
              },
            )}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

export default OptionSelect
