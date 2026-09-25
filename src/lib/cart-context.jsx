import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { api } from "@/api/apiClient";

const CartContext = createContext(null);
const STORAGE_KEY = "drivo_cart_v1";

const initialState = {
  items: [],
  isOpen: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, items: action.items || [] };
    case "ADD": {
      const { product, quantity = 1, variant } = action;
      const key = variant
        ? `${product.id}__${variant.name}__${variant.value}`
        : product.id;
      const existing = state.items.find((i) => i.key === key);
      let items;
      if (existing) {
        items = state.items.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + quantity } : i,
        );
      } else {
        items = [
          ...state.items,
          {
            key,
            product_id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price + (variant?.price_adjustment || 0),
            image_url: product.images?.[0] || "",
            quantity,
            variant: variant ? `${variant.name}: ${variant.value}` : null,
          },
        ];
      }
      return { ...state, items, isOpen: true };
    }
    case "UPDATE_QTY": {
      const items = state.items
        .map((i) =>
          i.key === action.key
            ? { ...i, quantity: Math.max(0, action.quantity) }
            : i,
        )
        .filter((i) => i.quantity > 0);
      return { ...state, items };
    }
    case "REMOVE":
      return {
        ...state,
        items: state.items.filter((i) => i.key !== action.key),
      };
    case "CLEAR":
      return { ...state, items: [] };
    case "OPEN_DRAWER":
      return { ...state, isOpen: true };
    case "CLOSE_DRAWER":
      return { ...state, isOpen: false };
    case "TOGGLE_DRAWER":
      return { ...state, isOpen: !state.isOpen };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch({ type: "HYDRATE", items: parsed.items });
      }
    } catch (e) {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }));
  }, [state.items]);

  const value = useMemo(() => {
    const count = state.items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
    return {
      items: state.items,
      isOpen: state.isOpen,
      count,
      subtotal,
      add: (product, quantity, variant) => {
        dispatch({ type: "ADD", product, quantity, variant });
        api.functions
          .invoke("LogProductEvent", {
            type: "add_to_cart",
            product_id: product.id,
            product_name: product.name,
            product_slug: product.slug,
            quantity: quantity || 1,
            variant: variant ? `${variant.name}: ${variant.value}` : null,
          })
          .catch(() => {});
      },
      updateQty: (key, quantity) =>
        dispatch({ type: "UPDATE_QTY", key, quantity }),
      remove: (key) => dispatch({ type: "REMOVE", key }),
      clear: () => dispatch({ type: "CLEAR" }),
      openDrawer: () => dispatch({ type: "OPEN_DRAWER" }),
      closeDrawer: () => dispatch({ type: "CLOSE_DRAWER" }),
      toggleDrawer: () => dispatch({ type: "TOGGLE_DRAWER" }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
