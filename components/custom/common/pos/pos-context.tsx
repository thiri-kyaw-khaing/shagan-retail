"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import type { CartItemData } from "@/lib/types/model/cart";
import type { Product } from "@/lib/types/model/product";
import {
  heldSales as initialHeldSales,
  type HeldSale,
} from "@/lib/types/model/heldsale";

type PosContextValue = {
  cart: CartItemData[];
  setCart: Dispatch<SetStateAction<CartItemData[]>>;
  addToCart: (product: Product) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  heldSales: HeldSale[];
  holdCurrentCart: (
    customerName: string,
    discountPercent: number | null,
  ) => void;
  resumeHeldSale: (heldSaleId: number) => boolean;
};

const PosContext = createContext<PosContextValue | null>(null);

export function PosProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItemData[]>([]);

  const [heldSales, setHeldSales] = useState<HeldSale[]>(initialHeldSales);

  const addToCart = (product: Product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.productId === product.id,
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...currentCart,
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

  const increaseQuantity = (productId: number) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  };

  const decreaseQuantity = (productId: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const holdCurrentCart = (
    customerName: string,
    discountPercent: number | null,
  ) => {
    if (cart.length === 0) return;

    const heldSale: HeldSale = {
      id: Date.now(),
      customerName,
      items: cart.map((item) => ({ ...item })),
      discountPercent,
      heldAt: Date.now(),
    };

    setHeldSales((current) => [heldSale, ...current]);

    // Begin a new empty sale.
    setCart([]);
  };

  const resumeHeldSale = (heldSaleId: number) => {
    const selectedSale = heldSales.find((sale) => sale.id === heldSaleId);

    if (!selectedSale) return false;

    setCart(selectedSale.items.map((item) => ({ ...item })));

    setHeldSales((current) => current.filter((sale) => sale.id !== heldSaleId));

    return true;
  };

  return (
    <PosContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        heldSales,
        holdCurrentCart,
        resumeHeldSale,
      }}
    >
      {children}
    </PosContext.Provider>
  );
}

export function usePos() {
  const context = useContext(PosContext);

  if (!context) {
    throw new Error("usePos must be used inside PosProvider");
  }

  return context;
}
