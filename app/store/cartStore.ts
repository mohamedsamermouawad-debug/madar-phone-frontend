import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../components/products/types";

export interface CartItem {
  id: string;
  product: Product;
  qty: number;
  color?: string;
  storage?: string;
  price: number;
  image?: string;
}

export interface CustomerInfo {
  name: string;
  nationalId: string;
  whatsapp: string;
  address: string;
  installmentType: "full" | "installment";
  months: number;
  downPayment: number;
}

interface CartState {
  items: CartItem[];
  customer: CustomerInfo | null;
  addItem: (
    product: Product,
    qty?: number,
    variant?: { color?: string; storage?: string; price?: number; image?: string }
  ) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  setCustomer: (info: CustomerInfo) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customer: null,
      addItem: (product, qty = 1, variant) =>
        set((s) => {
          const color = variant?.color || product.color || "";
          const storage = variant?.storage || product.storage || "";
          const price =
            variant?.price !== undefined
              ? variant.price
              : product.salePrice ?? product.originalPrice ?? product.price ?? 0;
          const image =
            variant?.image ||
            (product.images?.[0] || (product as { image?: string }).image || "");
          const itemId = `${product._id}_${color}_${storage}`.replace(/\s+/g, "-");

          const existingIndex = s.items.findIndex(
            (i) => i.id === itemId || (!i.id && i.product._id === product._id && (i.color || "") === color && (i.storage || "") === storage)
          );

          if (existingIndex > -1) {
            const updated = [...s.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              qty: updated[existingIndex].qty + qty,
              price: price,
              image: image || updated[existingIndex].image,
            };
            return { items: updated };
          }

          return {
            items: [
              ...s.items,
              {
                id: itemId,
                product,
                qty,
                color,
                storage,
                price,
                image,
              },
            ],
          };
        }),
      removeItem: (id) =>
        set((s) => ({
          items: s.items.filter((i) => i.id !== id && i.product._id !== id),
        })),
      updateQty: (id, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.id !== id && i.product._id !== id)
              : s.items.map((i) =>
                  i.id === id || i.product._id === id ? { ...i, qty } : i
                ),
        })),
      setCustomer: (info) => set({ customer: info }),
      clear: () => set({ items: [], customer: null }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      totalPrice: () =>
        get().items.reduce(
          (sum, i) =>
            sum +
            (i.price ?? i.product.salePrice ?? i.product.originalPrice ?? i.product.price ?? 0) *
              i.qty,
          0
        ),
    }),
    { name: "cart-storage" }
  )
);
