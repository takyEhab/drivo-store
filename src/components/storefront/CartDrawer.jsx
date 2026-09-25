import React, { useState } from "react";
import { Link } from "react-router-dom";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatEGP } from "@/lib/format";
import { Image } from "@/components/ui/image";

export default function CartDrawer() {
  const { items, isOpen, subtotal, count, closeDrawer, updateQty, remove } =
    useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={closeDrawer} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="font-heading text-lg font-bold tracking-tight">
              Cart{" "}
              {count > 0 && (
                <span className="font-mono-num text-muted-foreground">
                  ({count})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            aria-label="Close cart"
            className="p-2 -mr-2 hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/40" />
            <div>
              <p className="font-heading text-lg font-semibold">
                Your cart is empty
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Add some style to your ride.
              </p>
            </div>
            <Link
              to="/products"
              onClick={closeDrawer}
              className="mt-2 px-6 py-3 bg-foreground text-background font-medium text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.map((item) => (
                <div key={item.key} className="flex gap-3">
                  <Link
                    to={`/products/${item.slug}`}
                    onClick={closeDrawer}
                    className="w-20 h-20 shrink-0 bg-muted overflow-hidden"
                  >
                    {item.image_url && (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        fittingType="fill"
                      />
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.slug}`}
                      onClick={closeDrawer}
                      className="font-heading text-sm font-semibold line-clamp-2 hover:text-accent"
                    >
                      {item.name}
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.variant}
                      </p>
                    )}
                    <p className="font-mono-num text-sm font-bold mt-1">
                      {formatEGP(item.price)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => updateQty(item.key, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-muted"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-mono-num text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.key, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-muted"
                          aria-label="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(item.key)}
                        className="p-1.5 text-muted-foreground hover:text-destructive"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-mono-num text-xl font-bold">
                  {formatEGP(subtotal)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping & taxes calculated at checkout. Cash on Delivery
                available.
              </p>
              <Link
                to="/checkout"
                onClick={closeDrawer}
                className="block w-full py-4 bg-accent text-accent-foreground font-heading font-bold text-center hover:bg-accent/90 transition-colors"
              >
                Checkout
              </Link>
              <button
                onClick={closeDrawer}
                className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
