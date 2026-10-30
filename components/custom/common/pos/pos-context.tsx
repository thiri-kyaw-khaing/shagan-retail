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
import type { ReceiptShop } from "@/lib/printer/from-sale";
import {
  cancelDiscountApprovalAction,
  holdSaleAction,
  resumeHeldSaleAction,
  type PosResult,
} from "@/lib/pos/actions";
import type { CartCustomDiscount, CartItemData } from "@/lib/types/model/cart";
import type { SellableCombo } from "@/lib/types/model/combos";
import type { HeldSale } from "@/lib/types/model/heldsale";
import type { Product } from "@/lib/types/model/product";

/** This till's session, loaded on the server (see lib/pos/till-context.ts). */
export type TillInfo = {
  shiftId: number;
  deviceId: number;
  branchId: number;
  branchName: string;
  staffName: string;
  /** `apply_manual_discount`: may ask for a custom discount at all. */
  canAskDiscount: boolean;
  /** `approve_manual_discount` + `approve_own_discount`: approves their own, no PIN pad. */
  canSelfApproveDiscount: boolean;
  /** The branch's receipt header and footer (Customize Receipt); null if none is set up. */
  receiptShop: ReceiptShop | null;
};

export type SaleCustomer = { id: number; name: string };

type PosContextValue = {
  till: TillInfo;
  cart: CartItemData[];
  setCart: Dispatch<SetStateAction<CartItemData[]>>;
  /** Adds one unit to the product's line without a custom discount. */
  addToCart: (product: Product) => void;
  /** Adds one combo (one cart line per combo, its quantity = how many). */
  addCombo: (combo: SellableCombo) => void;
  increaseQuantity: (lineId: string) => void;
  decreaseQuantity: (lineId: string) => void;
  /** The product grid's stepper: the line without a custom discount first. */
  decreaseProduct: (productId: number) => void;
  /**
   * Puts an approved custom discount on `qty` units of a line, splitting it
   * when the approval covers fewer units than the line has.
   */
  applyCustomDiscount: (lineId: string, discount: CartCustomDiscount) => void;
  /** Takes a custom discount off (its approval is withdrawn). */
  removeCustomDiscount: (lineId: string) => void;
  customer: SaleCustomer | null;
  setCustomer: (customer: SaleCustomer | null) => void;
  /** Clears the cart and customer for the next sale. */
  resetOrder: () => void;
  heldSales: HeldSale[];
  /**
   * Parks the cart on the server and clears it for the next customer. Custom
   * discounts are taken off first: their approvals belong to this cashier and
   * shift, so they can't travel with a held sale.
   */
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

const newLineId = () => crypto.randomUUID();

/** Units of a product a cart line takes from stock - a combo takes its parts'. */
const unitsIn = (item: CartItemData, productId: number, quantity = item.quantity) =>
  item.combo
    ? (item.combo.parts.find((part) => part.productId === productId)?.qty ?? 0) * quantity
    : item.productId === productId
      ? quantity
      : 0;

/** Units of a product already in the cart, across all its lines (combos included). */
export const unitsOf = (cart: CartItemData[], productId: number, exceptLineId?: string) =>
  cart.reduce((sum, item) => (item.lineId === exceptLineId ? sum : sum + unitsIn(item, productId)), 0);

/** Whether `quantity` of this combo line fits the stock left after the rest of the cart. */
const comboFits = (cart: CartItemData[], item: CartItemData, quantity: number) =>
  !!item.combo?.parts.every(
    (part) => unitsOf(cart, part.productId, item.lineId) + part.qty * quantity <= part.stock,
  );

/** The cart with every custom discount taken off (lines of one product merged back). */
function withoutCustomDiscounts(cart: CartItemData[]): CartItemData[] {
  const merged: CartItemData[] = [];
  for (const item of cart) {
    const plain = { ...item, custom: undefined };
    // A combo line stays as it is (it never has a custom discount).
    const existing = !item.combo && merged.find((line) => !line.combo && line.productId === item.productId);
    if (existing) existing.quantity += item.quantity;
    else merged.push(plain);
  }
  return merged;
}

export function PosProvider({ till, initialHeldSales, children }: PosProviderProps) {
  const [cart, setCart] = useState<CartItemData[]>([]);
  const [customer, setCustomer] = useState<SaleCustomer | null>(null);
  // Kept locally after load, so a hold/resume shows at once; the server copy
  // is what other tills at the branch see.
  const [heldSales, setHeldSales] = useState<HeldSale[]>(initialHeldSales);

  /** Best effort: an approval left behind is cancelled when the shift closes. */
  const withdraw = (approvalId: string) => {
    void cancelDiscountApprovalAction(approvalId).catch(() => undefined);
  };

  const addToCart = (product: Product) => {
    setCart((currentCart) => {
      if (unitsOf(currentCart, product.id) >= product.stock) return currentCart;
      const plainLine = currentCart.find((item) => item.productId === product.id && !item.custom && !item.combo);

      if (plainLine) {
        return currentCart.map((item) =>
          item.lineId === plainLine.lineId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      // Price, catalog discount and tax % are snapshotted when the item is added.
      return [
        ...currentCart,
        {
          lineId: newLineId(),
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: 1,
          unitDiscount: product.discount,
          catalogPercent: product.discountPercent,
          taxPercent: product.taxPercent,
          maxQuantity: product.stock,
        },
      ];
    });
  };

  const addCombo = (combo: SellableCombo) => {
    setCart((currentCart) => {
      const line = currentCart.find((item) => item.combo?.comboId === combo.id);
      if (line) {
        if (!comboFits(currentCart, line, line.quantity + 1)) return currentCart;
        return currentCart.map((item) => (item === line ? { ...item, quantity: item.quantity + 1 } : item));
      }
      const newLine: CartItemData = {
        lineId: newLineId(),
        productId: 0,
        name: combo.name,
        // A combo never raises a price: at most its parts' normal total.
        price: Math.min(combo.price, combo.normalPrice),
        imageUrl: combo.imageUrl,
        quantity: 1,
        combo: {
          comboId: combo.id,
          parts: combo.parts.map(({ productId, name, qty, price, taxPercent, stock }) => ({
            productId,
            name,
            qty,
            price,
            taxPercent,
            stock,
          })),
        },
      };
      return comboFits(currentCart, newLine, 1) ? [...currentCart, newLine] : currentCart;
    });
  };

  const increaseQuantity = (lineId: string) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.lineId !== lineId) return item;
        if (item.combo) {
          return comboFits(currentCart, item, item.quantity + 1) ? { ...item, quantity: item.quantity + 1 } : item;
        }
        const stockLeft = (item.maxQuantity ?? Infinity) - unitsOf(currentCart, item.productId, lineId);
        // A custom discount was approved for so many units, no more.
        const cap = Math.min(stockLeft, item.custom?.maxQty ?? Infinity);
        return { ...item, quantity: Math.min(item.quantity + 1, cap) };
      }),
    );
  };

  const decreaseQuantity = (lineId: string) => {
    const line = cart.find((item) => item.lineId === lineId);
    if (line?.custom && line.quantity <= 1) withdraw(line.custom.approvalId);
    setCart((currentCart) =>
      currentCart
        .map((item) => (item.lineId === lineId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const decreaseProduct = (productId: number) => {
    const lines = cart.filter((item) => item.productId === productId && !item.combo);
    const line = lines.find((item) => !item.custom) ?? lines.at(-1);
    if (line) decreaseQuantity(line.lineId);
  };

  const applyCustomDiscount = (lineId: string, discount: CartCustomDiscount) => {
    setCart((currentCart) =>
      currentCart.flatMap((item) => {
        if (item.lineId !== lineId) return [item];
        const discounted = Math.min(discount.maxQty, item.quantity);
        const rest = item.quantity - discounted;
        const customLine = { ...item, quantity: discounted, custom: discount };
        // e.g. 1 of 2 coffees discounted: the other stays on its own line.
        return rest > 0
          ? [{ ...item, quantity: rest }, { ...customLine, lineId: newLineId() }]
          : [customLine];
      }),
    );
  };

  const removeCustomDiscount = (lineId: string) => {
    const line = cart.find((item) => item.lineId === lineId);
    if (!line?.custom) return;
    withdraw(line.custom.approvalId);
    setCart((currentCart) => {
      const plainLine = currentCart.find(
        (item) => item.productId === line.productId && !item.custom && item.lineId !== lineId,
      );
      if (!plainLine) {
        return currentCart.map((item) => (item.lineId === lineId ? { ...item, custom: undefined } : item));
      }
      return currentCart
        .filter((item) => item.lineId !== lineId)
        .map((item) =>
          item.lineId === plainLine.lineId ? { ...item, quantity: item.quantity + line.quantity } : item,
        );
    });
  };

  const resetOrder = () => {
    setCart([]);
    setCustomer(null);
  };

  const holdCurrentCart = async (walkInLabel: string): Promise<PosResult> => {
    if (cart.length === 0) return { ok: true, data: undefined };

    const result = await holdSaleAction({
      items: { lines: withoutCustomDiscounts(cart), customerName: customer?.name ?? walkInLabel },
      customerId: customer?.id ?? null,
      discountPercent: 0,
    });
    if (!result.ok) return result;

    for (const item of cart) if (item.custom) withdraw(item.custom.approvalId);
    const heldSale = toHeldSale(result.data);
    if (heldSale) setHeldSales((current) => [heldSale, ...current]);
    resetOrder();
    return { ok: true, data: undefined };
  };

  const resumeHeldSale = async (heldSaleId: number): Promise<PosResult> => {
    const result = await resumeHeldSaleAction(heldSaleId);
    if (!result.ok) {
      // Only drop it when another till already resumed it; otherwise it's still held.
      if (result.gone) setHeldSales((current) => current.filter((sale) => sale.id !== heldSaleId));
      return result;
    }

    const selectedSale = toHeldSale(result.data);
    setHeldSales((current) => current.filter((sale) => sale.id !== heldSaleId));
    if (!selectedSale) return { ok: false, error: "This held sale can't be opened at this till." };

    setCart(selectedSale.items.map((item) => ({ ...item })));
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
        addCombo,
        increaseQuantity,
        decreaseQuantity,
        decreaseProduct,
        applyCustomDiscount,
        removeCustomDiscount,
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
