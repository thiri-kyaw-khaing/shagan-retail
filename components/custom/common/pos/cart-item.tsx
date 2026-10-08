
import QuantityStepper from "@/components/custom/common/quantity-stepper";
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
        {/* eslint-disable-next-line @next/next/no-img-element -- presigned, expiring storage URL; not optimizable */}
        <img src={item.imageUrl} alt={item.name} className="absolute inset-0 size-full object-cover" />
      </div>

      {/* Product name and quantity */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-slate-900">{item.name}</h3>

        <div className="mt-2">
          <QuantityStepper
            value={item.quantity}
            min={0}
            onChange={(next) => {
              if (next > item.quantity) onIncrease(item.productId);
              else onDecrease(item.productId);
            }}
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
