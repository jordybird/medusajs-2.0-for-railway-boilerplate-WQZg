/* storefront/src/app/[countryCode]/(main)/account/@dashboard/profile/page.tsx */
import { Metadata } from "next"
import { notFound } from "next/navigation"

import ProfilePhone from "@modules/account/components/profile-phone"
import ProfileBillingAddress from "@modules/account/components/profile-billing-address"
import ProfileEmail from "@modules/account/components/profile-email"
import ProfileName from "@modules/account/components/profile-name"
import ProfilePassword from "@modules/account/components/profile-password"
import ProfileDob from "@modules/account/components/profile-dob"
import ProfileIDVerification from "@modules/account/components/profile-id-verification"

import { listRegions } from "@lib/data/regions"
import { getCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your Higher Up Smoke Shop profile.",
}

export default async function Profile() {
  const customer = await getCustomer()
  const regions   = await listRegions()

  if (!customer || !regions) notFound()

  return (
    <div className="w-full" data-testid="profile-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Profile</h1>
        <p className="text-base-regular">
          View and update your profile information, including your name, date of
          birth, email, phone number, and billing address.
        </p>
      </div>

      <div className="flex flex-col gap-y-8 w-full">
        <ProfileName customer={customer} />
        <Divider />

        <ProfileDob customer={customer} />
        <Divider />

        <ProfileEmail customer={customer} />
        <Divider />

        <ProfilePhone customer={customer} />
        <Divider />

        <ProfilePassword customer={customer} />
        <Divider />

        <ProfileBillingAddress customer={customer} regions={regions} />
        <Divider />

        <ProfileIDVerification customer={customer} />
      </div>
    </div>
  )
}

const Divider = () => <div className="w-full h-px bg-ui-border-base" />
