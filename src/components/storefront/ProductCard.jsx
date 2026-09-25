import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Plus } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatEGP, discountPercent, classNames } from "@/lib/format";
import { Image } from "@/components/ui/image";

export default function ProductCard({ product, featured = false }) {
  const { add } = useCart();
  const discount = discountPercent(product.price, product.compare_at_price);
  const unavailable = product.availability !== "AVAILABLE";

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (unavailable) return;
    add(product, 1);
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className={classNames(
        "group relative flex flex-col bg-card border border-border overflow-hidden transition-all duration-300 hover:border-foreground/30 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)]",
        featured ? "md:col-span-2 md:row-span-2" : "",
      )}
    >
      <div
        className={classNames(
          "relative overflow-hidden bg-muted",
          featured ? "aspect-square md:aspect-[4/3]" : "aspect-square",
        )}
      >
        <Image
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          fittingType="fill"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="font-mono-num text-[10px] font-bold tracking-wider uppercase bg-accent text-accent-foreground px-2 py-1">
              -{discount}%
            </span>
          )}
          {product.bestseller && (
            <span className="font-mono-num text-[10px] font-bold tracking-wider uppercase bg-foreground text-background px-2 py-1">
              Best Seller
            </span>
          )}
          {product.new_arrival && (
            <span className="font-mono-num text-[10px] font-bold tracking-wider uppercase bg-background text-foreground border border-foreground px-2 py-1">
              New
            </span>
          )}
        </div>
        {unavailable && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="font-mono-num text-[11px] font-bold tracking-wider uppercase text-foreground">
              {product.availability === "DISCONTINUED"
                ? "Discontinued"
                : "Out of Stock"}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-sm font-semibold leading-snug line-clamp-2 group-hover:text-foreground">
            {product.name}
          </h3>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col">
            <span className="font-mono-num text-base font-bold text-foreground">
              {formatEGP(product.price)}
            </span>
            {product.compare_at_price &&
              product.compare_at_price > product.price && (
                <span className="font-mono-num text-xs text-muted-foreground line-through">
                  {formatEGP(product.compare_at_price)}
                </span>
              )}
          </div>
          <button
            onClick={handleAdd}
            disabled={unavailable}
            aria-label="Add to cart"
            className="shrink-0 w-9 h-9 flex items-center justify-center bg-foreground text-background hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
