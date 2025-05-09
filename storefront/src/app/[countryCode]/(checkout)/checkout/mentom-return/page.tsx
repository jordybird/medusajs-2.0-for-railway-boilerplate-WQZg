"use client"

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Text, Heading } from "@medusajs/ui";
import { placeOrder } from "@lib/data/cart"; // Assuming placeOrder is the correct function to finalize

const MentomReturnPage = () => {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const externalId = searchParams.get("externalId"); // This should be the cart ID
  const mentomTxId = searchParams.get("id"); // Mentom transaction ID

  useEffect(() => {
    if (status === "Success" && externalId) {
      // Payment was successful, finalize the order in Medusa
      // You might need to pass the mentomTxId to placeOrder or another function
      // depending on how your backend handles order finalization after Hosted Form
      placeOrder()
        .then(() => {
          console.log("Order placed successfully after Mentom Hosted Form payment.");
          // Redirect to order confirmation page or display success message
        })
        .catch((error) => {
          console.error("Error placing order after Mentom Hosted Form payment:", error);
          // Display error message
        });
    } else if (status === "Failed" || status === "Cancelled") {
      // Payment failed or was cancelled
      console.error("Mentom Hosted Form payment failed or was cancelled. Status:", status);
      // Display failure message
    }
  }, [status, externalId, mentomTxId]); // Depend on status, externalId, and mentomTxId

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      {status === "Success" && (
        <Heading level="h1" className="text-green-500">Payment Successful!</Heading>
      )}
      {status === "Failed" && (
        <Heading level="h1" className="text-red-500">Payment Failed</Heading>
      )}
       {status === "Cancelled" && (
        <Heading level="h1" className="text-yellow-500">Payment Cancelled</Heading>
      )}
      {!status && (
         <Heading level="h1">Processing Payment...</Heading>
      )}
      {/* You can add more details here based on other parameters if needed */}
      <Text className="mt-4">Status: {status}</Text>
      {externalId && <Text>Order Reference: {externalId}</Text>}
      {mentomTxId && <Text>Transaction ID: {mentomTxId}</Text>}
    </div>
  );
};

export default MentomReturnPage;
