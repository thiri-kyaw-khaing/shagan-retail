import Image from "next/image";
import { Minus, Plus } from "lucide-react";

import CustomButton from "@/components/custom/common/custom-button";
import type { CartItemData } from "@/lib/types/model/cart";

type CartItemProps = {
  item: CartItemData;
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
};

export default function CartItem({
  item,
  onIncrease,
  onDecrease,
}: CartItemProps) {
  const totalPrice = item.price * item.quantity;

  return (
    <article className="flex items-start gap-3 border-b border-slate-100 p-4">
      {/* Product image */}
      <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-slate-100">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="44px"
          className="object-cover"
        />
      </div>

      {/* Product name and quantity */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-slate-900">{item.name}</h3>

        <div className="mt-2 flex items-center gap-3">
          <CustomButton
            icon={Minus}
            onClick={() => onDecrease(item.productId)}
            className="size-11 rounded-lg bg-slate-100 p-0 text-slate-600 shadow-none hover:bg-slate-200"
          />

          <span
            className="min-w-6 text-center font-semibold text-slate-900"
            aria-label={`Quantity ${item.quantity}`}
          >
            {item.quantity}
          </span>

          <CustomButton
            icon={Plus}
            onClick={() => onIncrease(item.productId)}
            className="size-11 rounded-lg bg-slate-100 p-0 text-slate-600 shadow-none hover:bg-slate-200"
          />
        </div>
      </div>

      {/* Item total */}
      <p className="self-center whitespace-nowrap font-bold text-slate-900">
        K {totalPrice.toLocaleString()}
      </p>
    </article>
  );
}
