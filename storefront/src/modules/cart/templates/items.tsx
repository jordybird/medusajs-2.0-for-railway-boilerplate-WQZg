import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Heading, Table } from "@medusajs/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  items?: HttpTypes.StoreCartLineItem[]
}

const ItemsTemplate = ({ items }: ItemsTemplateProps) => {
  return (
    <section className="flex flex-col gap-y-6">
      {/* ───────── Title ───────── */}
      <Heading level="h1" className="text-2xl font-semibold text-white">
        Cart
      </Heading>

      {/* ───────── Table ───────── */}
      <Table className="bg-[#222222] rounded-lg overflow-hidden border border-gray-700">
        {/* Header */}
        <Table.Header className="bg-[#222222]">
          <Table.Row className="border-b !border-gray-700 text-white text-sm">
            <Table.HeaderCell className="!pl-4 !bg-[#222222]">
              Item
            </Table.HeaderCell>

            {/* empty cell for delete icon */}
            <Table.HeaderCell className="!bg-[#222222]" />

            <Table.HeaderCell className="!bg-[#222222]">
              Quantity
            </Table.HeaderCell>

            <Table.HeaderCell className="hidden small:table-cell !bg-[#222222]">
              Price
            </Table.HeaderCell>

            <Table.HeaderCell className="!pr-4 text-right !bg-[#222222]">
              Total
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        {/* Body */}
        <Table.Body className="[&_tr]:border-b [&_tr]:border-gray-700">
          {items
            ? items
                .sort((a, b) =>
                  (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                )
                .map((item) => <Item key={item.id} item={item} />)
            : repeat(5).map((i) => <SkeletonLineItem key={i} />)}
        </Table.Body>
      </Table>
    </section>
  )
}

export default ItemsTemplate
