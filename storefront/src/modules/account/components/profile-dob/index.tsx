"use client"

import { useState, useEffect, forwardRef } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import { CalendarDaysIcon } from "@heroicons/react/24/outline"

import AccountInfo from "../account-info"
import { updateCustomer } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */
const ACCENT = "#84cc16"                                 // lime-500

const isDark = () =>
  typeof window !== "undefined" &&
  document.documentElement.classList.contains("dark")

const surface = () => (isDark() ? "#18181B" : "#ffffff")
const text    = () => (isDark() ? "#F9FAFB" : "#111827")
const fieldBg = () => (isDark() ? "#222222" : "#f3f4f6")

/* trigger button with calendar icon -------------------------------- */
const Trigger = forwardRef<
  HTMLButtonElement,
  { value?: string; onClick?: () => void }
>(({ value, onClick }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={onClick}
    style={{
      width: 208,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 12px",
      background: fieldBg(),
      color: text(),
      border: `1px solid ${fieldBg()}`,
      borderRadius: 6,
      fontSize: "0.875rem",
    }}
  >
    <span>{value || "Select date"}</span>
    <CalendarDaysIcon width={20} height={20} color="#9ca3af" />
  </button>
))
Trigger.displayName = "Trigger"

/* ------------------------------------------------------------------ */
/* component                                                           */
/* ------------------------------------------------------------------ */
export default function ProfileDob({
  customer,
}: {
  customer: HttpTypes.StoreCustomer
}) {
  const initial =
    customer.metadata?.dob && typeof customer.metadata.dob === "string"
      ? new Date(customer.metadata.dob)
      : null

  const [date, setDate]    = useState<Date | null>(initial)
  const [saving, setSaving]  = useState(false)
  const [success, setSuccess] = useState(false)

  async function onSave() {
    if (!date) return
    setSaving(true)
    await updateCustomer({
      metadata: { dob: date.toISOString() },
    })
    setSuccess(true)
    setSaving(false)
  }

  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => setSuccess(false), 1800)
    return () => clearTimeout(t)
  }, [success])

  return (
    <AccountInfo
      label="Date of birth"
      currentInfo={
        date ? date.toLocaleDateString(undefined, { dateStyle: "medium" }) : "-"
      }
      isSuccess={success}
      isError={false}
      clearState={() => setSuccess(false)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <DatePicker
          selected={date}
          onChange={setDate}
          maxDate={new Date()}
          popperPlacement="bottom-start"
          popperProps={{ strategy: "fixed" }}
          showPopperArrow={false}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          todayButton="Today"
          calendarContainer={(p) => (
            <div
              {...p}
              style={{
                background: surface(),
                color: text(),
                borderRadius: 12,
                padding: 16,
                border: `1px solid ${fieldBg()}`,
                boxShadow: "0 10px 25px rgba(0,0,0,.45)",
              }}
            />
          )}
          customInput={<Trigger />}
          /* day cell styling */
          dayClassName={(d) =>
            [
              "hp-day",
              date && d.toDateString() === date.toDateString() ? "sel" : "",
              new Date().toDateString() === d.toDateString() ? "today" : "",
            ].join(" ")
          }
        />

        <button
          type="button"
          disabled={!date || saving}
          onClick={onSave}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            background: "var(--bg-base)",
            color: "#fff",
            opacity: !date || saving ? 0.4 : 1,
          }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {/* global overrides for calendar look */}
      <style jsx global>{`
        .react-datepicker__header {
          background: ${surface()};
          border-bottom: 1px solid ${fieldBg()};
          padding-bottom: 12px;
        }
        .react-datepicker__current-month {
          color: ${text()};
          font-weight: 600;
          margin-bottom: 8px;
        }
        .react-datepicker__triangle { display: none; }

        /* day grid */
        .hp-day {
          color: ${text()};
          width: 2.25rem;
          height: 2.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          transition: background 0.15s;
        }
        .hp-day:hover { background: ${ACCENT}22; }
        .hp-day.sel   { background: ${ACCENT}; color: ${surface()}; }
        .hp-day.today:not(.sel) { border: 1px solid ${ACCENT}; }

        .react-datepicker__day--outside-month { opacity: 0.35; }

        /* dropdowns */
        .react-datepicker__month-dropdown,
        .react-datepicker__year-dropdown {
          background: ${surface()};
          color: ${text()};
          max-height: 160px;
          overflow: auto;
        }

        /* today shortcut */
        .react-datepicker__today-button {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid ${fieldBg()};
          font-size: 0.75rem;
          color: ${ACCENT};
        }
        .react-datepicker__today-button:hover { text-decoration: underline; }
      `}</style>
    </AccountInfo>
  )
}
