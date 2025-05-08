import React from "react"
import { clx } from "@medusajs/ui"

interface RadioProps {
  checked: boolean
  "data-testid"?: string
}

/**
 * Final polish: radio / checkbox that is **always** visible
 * Light  – white fill, gray-400 border, brand-coloured dot
 * Dark   – transparent fill, **white border**, white dot
 */
const Radio: React.FC<RadioProps> = ({ checked, "data-testid": id }) => (
  <button
    type="button"
    role="radio"
    aria-checked={checked}
    data-state={checked ? "checked" : "unchecked"}
    className="relative inline-flex h-5 w-5 items-center justify-center focus:outline-none"
    data-testid={id || "radio-button"}
  >
    {/* outer ring */}
    <span
      className={clx(
        "transition-colors flex items-center justify-center h-4 w-4 rounded-sm border",
        "bg-white border-gray-400",               /* light */
        "dark:bg-transparent dark:border-white"   /* dark  */
      )}
    >
      {/* inner dot */}
      {checked && (
        <span
          className={clx(
            "h-2.5 w-2.5 rounded-sm",
            "bg-ui-fg-interactive",               /* light */
            "dark:bg-white"                       /* dark  */
          )}
        />
      )}
    </span>
  </button>
)

export default Radio