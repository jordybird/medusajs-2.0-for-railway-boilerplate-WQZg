/**
 * Thin wrapper kept only so the checkout folder structure
 * doesn’t break.  Mentom needs no client-side JS SDK.
 */
"use client"

import React from "react"
import { HttpTypes } from "@medusajs/types"

type WrapperProps = {
  cart: HttpTypes.StoreCart
  children: React.ReactNode
}

const Wrapper: React.FC<WrapperProps> = ({ children }) => <>{children}</>

export default Wrapper
