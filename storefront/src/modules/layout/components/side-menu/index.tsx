/*
  Side‑nav menu (client) with a collapsible Categories dropdown.
  – Uses shared listCategories() helper.
  – Active / hover states now use lime‑500 instead of gray.
*/

"use client"

import { Fragment, useEffect, useState } from "react"
import { Popover, Transition, Disclosure } from "@headlessui/react"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { Menu, ChevronRight, ArrowRight, X } from "lucide-react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import { HttpTypes } from "@medusajs/types"
import { listCategories } from "@lib/data/categories"

const SideMenuItems: Record<string, string> = {
  Home: "/",
  Store: "/store",
  Search: "/search",
  Account: "/account",
  Cart: "/cart",
}

interface SideMenuProps {
  regions: HttpTypes.StoreRegion[] | null
}

const SideMenu = ({ regions }: SideMenuProps) => {
  const toggleState = useToggleState()
  const [categories, setCategories] = useState<HttpTypes.StoreProductCategory[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    listCategories()
      .then((cats) => {
        if (!mounted) return
        setCategories(cats.filter((c) => !c.parent_category))
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              {/* Burger icon */}
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:text-lime-500"
                >
                  <Menu size={24} />
                </Popover.Button>
              </div>

              {/* Slide‑in panel */}
              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <Popover.Panel className="flex flex-col absolute w-full pr-4 sm:pr-0 sm:w-1/3 2xl:w-1/4 sm:min-w-min h-[calc(100vh-1rem)] z-30 inset-x-0 text-sm text-ui-fg-on-color m-2 backdrop-blur-2xl right-0 left-auto">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full bg-[rgba(3,7,18,0.5)] rounded-rounded justify-between p-6"
                  >
                    {/* Close button */}
                    <div className="flex justify-end" id="xmark">
                      <button data-testid="close-menu-button" onClick={close}>
                        <X size={24} className="hover:text-lime-500" />
                      </button>
                    </div>

                    {/* Main links */}
                    <ul className="flex flex-col gap-6 items-start justify-start">
                      {Object.entries(SideMenuItems).map(([name, href]) => (
                        <li key={name}>
                          <LocalizedClientLink
                            href={href}
                            className="text-3xl leading-10 hover:text-lime-500 focus:text-lime-500"
                            onClick={close}
                            data-testid={`${name.toLowerCase()}-link`}
                          >
                            {name}
                          </LocalizedClientLink>
                        </li>
                      ))}

                      {/* Categories dropdown */}
                      <Disclosure defaultOpen={false}>
                        {({ open: catOpen }) => (
                          <>
                            <Disclosure.Button
                              className="flex items-center text-3xl leading-10 gap-2 hover:text-lime-500 focus:outline-none"
                              disabled={loading && categories.length === 0}
                            >
                              Categories
                              <ChevronRight
                                size={24}
                                className={clx(
                                  "transition-transform duration-200",
                                  catOpen ? "rotate-90 text-lime-500" : "",
                                )}
                              />
                            </Disclosure.Button>
                            <Disclosure.Panel className="flex flex-col gap-4 ml-2 mt-2 max-h-72 overflow-y-auto pr-2">
                              {loading && categories.length === 0 ? (
                                <span className="text-lg text-ui-fg-subtle">Loading…</span>
                              ) : categories.length ? (
                                categories.map((cat) => (
                                  <LocalizedClientLink
                                    key={cat.id}
                                    href={`/categories/${cat.handle}`}
                                    className="text-xl leading-7 hover:text-lime-500 focus:text-lime-500"
                                    onClick={close}
                                  >
                                    {cat.name}
                                  </LocalizedClientLink>
                                ))
                              ) : (
                                <span className="text-lg text-ui-fg-subtle">No categories found.</span>
                              )}
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    </ul>

                    {/* Region selector & footer */}
                    <div className="flex flex-col gap-y-6">
                      <div
                        className="flex justify-between"
                        onMouseEnter={toggleState.open}
                        onMouseLeave={toggleState.close}
                      >
                        {regions && (
                          <CountrySelect toggleState={toggleState} regions={regions} />
                        )}
                        <ArrowRight
                          size={24}
                          className={clx(
                            "transition-transform duration-150 hover:text-lime-500",
                            toggleState.state ? "-rotate-90 text-lime-500" : "",
                          )}
                        />
                      </div>
                      <Text className="flex justify-between txt-compact-small">
                        © {new Date().getFullYear()} Higherup. All rights reserved.
                      </Text>
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu;
