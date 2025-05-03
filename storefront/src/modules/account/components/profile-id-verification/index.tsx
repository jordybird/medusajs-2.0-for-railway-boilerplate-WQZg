"use client";

import { useState } from "react";
import { HttpTypes } from "@medusajs/types";
import AccountInfo from "../account-info";

type Props = { customer: HttpTypes.StoreCustomer };

export default function ProfileIDVerification({ customer }: Props) {
  const isVerified = customer.metadata?.identity_verified === true;
  const [launching, setLaunching] = useState(false);

  async function startBlueCheck() {
    console.log("ID-verify button clicked");
    setLaunching(true);

    try {
      const res = await fetch("/api/bluecheck/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          email: customer.email, // optional pre-fill
        }),
      });

      if (!res.ok) throw new Error(`Backend ${res.status}`);

      const { link } = (await res.json()) as { link: string };
      window.location.assign(link); // 🔗 off to BlueCheck
    } catch (e) {
      console.error("BlueCheck start failed:", e);
      alert("Unable to start ID verification. Please try again.");
      setLaunching(false);
    }
  }

  return (
    <AccountInfo
      label="ID verification"
      currentInfo={isVerified ? "Verified" : "Not verified"}
      isSuccess={isVerified}
      isError={false}
      clearState={() => null}
      actionLabel={isVerified ? "Edit" : "Add"}
      onAction={isVerified ? undefined : startBlueCheck}
    >
      {/* we don’t render children; AccountInfo handles the button */}
    </AccountInfo>
  );
}
