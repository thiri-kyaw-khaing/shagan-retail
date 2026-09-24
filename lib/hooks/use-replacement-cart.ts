import { useState } from "react";
import type { CartItemData } from "@/lib/types/model/cart";
import type { Product } from "@/lib/types/model/product";

export function useReplacementCart() {
  const [cart, setCart] = useState<CartItemData[]>([]);

  const add = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: 1,
        },
      ];
    });
  };

  const setQty = (productId: number, qty: number) => {
    setCart((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity: qty } : item,
      ),
    );
  };

  const remove = (productId: number) => {
    setCart((current) => current.filter((item) => item.productId !== productId));
  };

  return { cart, add, setQty, remove };
}
