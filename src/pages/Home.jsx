import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductCard from "@/components/storefront/ProductCard";
import { Image } from "@/components/ui/image";
import Hero from "@/components/storefront/Hero";
import SEO from "@/components/SEO";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { categories } = useOutletContext();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Product.list("-created_date", 100)
      .then((res) => setProducts(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = products.filter((p) => p.featured).slice(0, 4);
  const bestsellers = products.filter((p) => p.bestseller).slice(0, 8);
  const newArrivals = products.filter((p) => p.new_arrival).slice(0, 8);
  const under100 = products
    .filter((p) => p.price < 100 && p.availability === "AVAILABLE")
    .slice(0, 8);

  return (
    <div>
      <SEO 
        title="Home"
        description="Shop the best car accessories in Egypt. Drivo offers premium styling, affordable prices, and cash on delivery."
      />
      {/* HERO */}
      <Hero />

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="font-mono-num text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
                {t("01 / Categories")}
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tighter">
                {t("Browse by Category")}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/products?category=${c.slug}`}
                className="group relative aspect-[4/5] overflow-hidden bg-muted"
              >
                {c.image_url && (
                  <Image
                    src={c.image_url}
                    alt={c.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    fittingType="fill"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="font-heading text-lg font-bold text-background">
                    {i18n.language.startsWith('ar') ? (c.name_ar || t(c.name)) : c.name}
                  </h3>
                  <span className="font-mono-num text-[11px] text-accent flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {t("Shop now")} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="font-mono-num text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
                {t("02 / Featured")}
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tighter">
                {t("Featured Upgrades")}
              </h2>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-1 text-sm font-medium hover:text-accent"
            >
              {t("View all")} <ArrowRight className={`w-4 h-4 transition-transform ${isAr ? "rotate-180" : ""}`} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* BEST SELLERS */}
      {bestsellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="font-mono-num text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
                {t("03 / Trending")}
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tighter">
                {t("Best Sellers")}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* UNDER 100 EGP */}
      {under100.length > 0 && (
        <section className="bg-card text-card-foreground py-16 md:py-24 my-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="font-mono-num text-xs tracking-[0.2em] uppercase text-accent mb-2">
                  {t("04 / Budget")}
                </p>
                <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tighter">
                  {t("Under 100 EGP")}
                </h2>
                <p className="text-foreground/60 text-sm mt-2">
                  {t("Small upgrades, big difference.")}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {under100.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="font-mono-num text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
                {t("05 / Fresh")}
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tighter">
                {t("New Arrivals")}
              </h2>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-1 text-sm font-medium hover:text-accent"
            >
              {t("View all")} <ArrowRight className={`w-4 h-4 transition-transform ${isAr ? "rotate-180" : ""}`} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {loading && (
        <div className="mx-auto max-w-7xl px-4 py-24 flex justify-center">
          <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
        </div>
      )}

      {/* CTA banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="bg-muted border border-border p-10 md:p-16 text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tighter">
            {t("Ready to style your ride?")}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            {t("Cash on Delivery across Egypt. Track your order in real time.")}
          </p>
          <Link
            to="/products"
            className="inline-flex mt-8 px-8 py-4 bg-foreground text-background font-heading font-bold hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {t("Start Shopping")}
          </Link>
        </div>
      </section>
    </div>
  );
}
