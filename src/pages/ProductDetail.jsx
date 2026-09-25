import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  ShoppingBag,
  Check,
  ChevronRight,
  Star,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useCart } from "@/lib/cart-context";
import { formatEGP, discountPercent, classNames } from "@/lib/format";
import ProductCard from "@/components/storefront/ProductCard";
import { Image } from "@/components/ui/image";
import SEO from "@/components/SEO";

const RECENTLY_VIEWED_KEY = "drivo_recently_viewed";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { add, openDrawer } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setActiveImage(0);
    setQty(1);
    setSelectedVariant(null);
    setAdded(false);
    base44.entities.Product.filter({ slug }, "-created_date", 1)
      .then(async (res) => {
        if (!active) return;
        const p = res[0];
        if (!p) {
          setLoading(false);
          return;
        }
        setProduct(p);
        if (p.variants?.length) setSelectedVariant(p.variants[0]);
        // recently viewed
        try {
          const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
          const arr = raw ? JSON.parse(raw) : [];
          const next = [p.id, ...arr.filter((id) => id !== p.id)].slice(0, 8);
          localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
        } catch (e) {}
        // related
        if (p.category_id) {
          const rel = await base44.entities.Product.filter(
            { category_id: p.category_id },
            "-created_date",
            5,
          );
          if (active) setRelated(rel.filter((r) => r.id !== p.id).slice(0, 4));
        }
        // reviews
        const revs = await base44.entities.Review.filter(
          { product_id: p.id, status: "approved" },
          "-created_date",
          50,
        );
        if (active) setReviews(revs);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const handleAdd = () => {
    if (!product || product.availability !== "AVAILABLE") return;
    add(product, qty, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const buyNow = () => {
    if (!product || product.availability !== "AVAILABLE") return;
    add(product, qty, selectedVariant);
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-32 px-4">
        <h1 className="font-heading text-3xl font-bold tracking-tighter">
          Product not found
        </h1>
        <Link
          to="/products"
          className="mt-6 inline-block text-accent font-medium"
        >
          ← Back to products
        </Link>
      </div>
    );
  }

  const discount = discountPercent(product.price, product.compare_at_price);
  const currentPrice = product.price + (selectedVariant?.price_adjustment || 0);
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div>
      <SEO 
        title={product.name}
        description={product.description?.slice(0, 150) + "..." || `Buy ${product.name} at Drivo.`}
        image={product.images?.[0]}
        type="product"
      />
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-foreground">
          Products
        </Link>
        {product.category_slug && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link
              to={`/products?category=${product.category_slug}`}
              className="hover:text-foreground capitalize"
            >
              {product.category_slug}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground truncate">{product.name}</span>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div>
            <div className="aspect-square bg-muted overflow-hidden border border-border">
              {product.images?.[activeImage] && (
                <Image
                  src={product.images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  fittingType="fill"
                />
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={classNames(
                      "w-20 h-20 shrink-0 overflow-hidden border-2 transition-colors",
                      activeImage === i
                        ? "border-foreground"
                        : "border-border hover:border-foreground/40",
                    )}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                      fittingType="fill"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              {discount > 0 && (
                <span className="font-mono-num text-[11px] font-bold tracking-wider uppercase bg-accent text-accent-foreground px-2 py-1">
                  -{discount}% OFF
                </span>
              )}
              {product.bestseller && (
                <span className="font-mono-num text-[11px] font-bold tracking-wider uppercase bg-foreground text-background px-2 py-1">
                  Best Seller
                </span>
              )}
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tighter">
              {product.name}
            </h1>

            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={classNames(
                        "w-4 h-4",
                        n <= Math.round(avgRating)
                          ? "fill-foreground text-foreground"
                          : "text-muted-foreground/30",
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {avgRating.toFixed(1)} ({reviews.length})
                </span>
              </div>
            )}

            <div className="flex items-end gap-3 mt-5">
              <span className="font-mono-num text-3xl md:text-4xl font-bold">
                {formatEGP(currentPrice)}
              </span>
              {product.compare_at_price &&
                product.compare_at_price > product.price && (
                  <span className="font-mono-num text-lg text-muted-foreground line-through mb-1">
                    {formatEGP(product.compare_at_price)}
                  </span>
                )}
            </div>

            <p className="text-muted-foreground text-sm mt-2">
              {product.availability === "AVAILABLE" ? (
                <span className="flex items-center gap-1.5 text-accent font-medium">
                  <Check className="w-4 h-4" /> In stock — ready to ship
                </span>
              ) : product.availability === "TEMPORARILY_UNAVAILABLE" ? (
                <span className="text-destructive">
                  Temporarily unavailable
                </span>
              ) : (
                <span className="text-muted-foreground">Discontinued</span>
              )}
            </p>

            {product.description && (
              <p className="mt-6 text-foreground/80 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-mono-num text-[11px] tracking-wider uppercase text-muted-foreground mb-3">
                  {product.variants[0].name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVariant(v)}
                      className={classNames(
                        "px-4 py-2.5 border text-sm font-medium transition-colors",
                        selectedVariant?.value === v.value
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground",
                      )}
                    >
                      {v.value}
                      {v.price_adjustment
                        ? ` (+${formatEGP(v.price_adjustment)})`
                        : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Add */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center border border-border">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-11 h-12 flex items-center justify-center hover:bg-muted"
                  aria-label="Decrease"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-mono-num font-bold">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-11 h-12 flex items-center justify-center hover:bg-muted"
                  aria-label="Increase"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAdd}
                disabled={product.availability !== "AVAILABLE"}
                className="flex-1 h-12 flex items-center justify-center gap-2 border border-foreground hover:bg-foreground hover:text-background disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-heading font-bold"
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" /> Added
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" /> Add to Cart
                  </>
                )}
              </button>
            </div>
            <button
              onClick={buyNow}
              disabled={product.availability !== "AVAILABLE"}
              className="mt-3 w-full h-12 bg-accent text-accent-foreground font-heading font-bold hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Buy Now
            </button>

            <div className="mt-8 pt-6 border-t border-border space-y-2 text-sm text-muted-foreground">
              <p>✓ Cash on Delivery available</p>
              <p>✓ Fast shipping across Egypt</p>
              <p>✓ Track your order in real time</p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="mt-16 md:mt-24">
            <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tighter mb-6">
              Customer Reviews
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {reviews.map((r) => (
                <div key={r.id} className="border border-border p-5 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading font-semibold">
                      {r.customer_name || "Verified Buyer"}
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={classNames(
                            "w-3.5 h-3.5",
                            n <= r.rating
                              ? "fill-foreground text-foreground"
                              : "text-muted-foreground/30",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-foreground/80 text-sm leading-relaxed">
                    {r.comment}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16 md:mt-24">
            <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tighter mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
