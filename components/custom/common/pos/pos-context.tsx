"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import { toHeldSale } from "@/lib/api/mappers";
import { holdSaleAction, resumeHeldSaleAction, type PosResult } from "@/lib/pos/actions";
import type { CartItemData } from "@/lib/types/model/cart";
import type { HeldSale } from "@/lib/types/model/heldsale";
import type { Product } from "@/lib/types/model/product";

/** This till's session, loaded on the server (see lib/pos/till-context.ts). */
export type TillInfo = {
  shiftId: number;
  deviceId: number;
  branchId: number;
  branchName: string;
  staffName: string;
  /** The cashier's own permission; without it a discounted sale needs a manager. */
  canApplyDiscount: boolean;
};

export type SaleCustomer = { id: number; name: string };

type PosContextValue = {
  till: TillInfo;
  cart: CartItemData[];
  setCart: Dispatch<SetStateAction<CartItemData[]>>;
  addToCart: (product: Product) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  /** Order-level manual discount, 0-100. */
  discountPercent: number;
  setDiscountPercent: (percent: number) => void;
  customer: SaleCustomer | null;
  setCustomer: (customer: SaleCustomer | null) => void;
  /** Clears the cart, discount and customer for the next sale. */
  resetOrder: () => void;
  heldSales: HeldSale[];
  /** Parks the cart on the server and clears it for the next customer. */
  holdCurrentCart: (walkInLabel: string) => Promise<PosResult>;
  /** Loads a held sale back into the cart (it's removed from the server). */
  resumeHeldSale: (heldSaleId: number) => Promise<PosResult>;
};

const PosContext = createContext<PosContextValue | null>(null);

type PosProviderProps = {
  till: TillInfo;
  /** This branch's held sales, loaded on the server. */
  initialHeldSales: HeldSale[];
  children: ReactNode;
};

export function PosProvider({ till, initialHeldSales, children }: PosProviderProps) {
  const [cart, setCart] = useState<CartItemData[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [customer, setCustomer] = useState<SaleCustomer | null>(null);
  // Kept locally after load, so a hold/resume shows at once; the server copy
  // is what other tills at the branch see.
  const [heldSales, setHeldSales] = useState<HeldSale[]>(initialHeldSales);

  const addToCart = (product: Product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.productId === product.id);

      if (existingItem) {
        return currentCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item,
        );
      }
      if (product.stock < 1) return currentCart;

      // Price, catalog discount and tax are snapshotted when the item is added.
      return [
        ...currentCart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: 1,
          unitDiscount: product.discount,
          unitTax: product.tax,
          maxQuantity: product.stock,
        },
      ];
    });
  };

  const increaseQuantity = (productId: number) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(item.quantity + 1, item.maxQuantity ?? Infinity) }
          : item,
      ),
    );
  };

  const decreaseQuantity = (productId: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const resetOrder = () => {
    setCart([]);
    setDiscountPercent(0);
    setCustomer(null);
  };

  const holdCurrentCart = async (walkInLabel: string): Promise<PosResult> => {
    if (cart.length === 0) return { ok: true, data: undefined };

    const result = await holdSaleAction({
      items: { lines: cart, customerName: customer?.name ?? walkInLabel },
      customerId: customer?.id ?? null,
      discountPercent,
    });
    if (!result.ok) return result;

    const heldSale = toHeldSale(result.data);
    if (heldSale) setHeldSales((current) => [heldSale, ...current]);
    resetOrder();
    return { ok: true, data: undefined };
  };

  const resumeHeldSale = async (heldSaleId: number): Promise<PosResult> => {
    const result = await resumeHeldSaleAction(heldSaleId);
    if (!result.ok) {
      // Gone from the server either way (e.g. resumed on another till).
      if (!result.signedOut) setHeldSales((current) => current.filter((sale) => sale.id !== heldSaleId));
      return result;
    }

    const selectedSale = toHeldSale(result.data);
    setHeldSales((current) => current.filter((sale) => sale.id !== heldSaleId));
    if (!selectedSale) return { ok: false, error: "This held sale can't be opened at this till." };

    setCart(selectedSale.items.map((item) => ({ ...item })));
    setDiscountPercent(selectedSale.discountPercent ?? 0);
    setCustomer(selectedSale.customer ?? null);
    return { ok: true, data: undefined };
  };

  return (
    <PosContext.Provider
      value={{
        till,
        cart,
        setCart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        discountPercent,
        setDiscountPercent,
        customer,
        setCustomer,
        resetOrder,
        heldSales,
        holdCurrentCart,
        resumeHeldSale,
      }}
    >
      {children}
    </PosContext.Provider>
  );
}

/** The sale's customer name, or the "Walk-in" label. */
export function useCustomerLabel(walkInLabel: string) {
  return usePos().customer?.name ?? walkInLabel;
}

export function usePos() {
  const context = useContext(PosContext);
  if (!context) throw new Error("usePos must be used inside PosProvider");
  return context;
}
