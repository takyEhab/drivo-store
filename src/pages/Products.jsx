import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { api } from "@/api/apiClient";
import ProductCard from "@/components/storefront/ProductCard";
import SEO from "@/components/SEO";
import { useTranslation } from "react-i18next";

export default function Products() {
  const { categories } = useOutletContext();
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [showFilters, setShowFilters] = useState(false);

  const q = searchParams.get("q") || "";
  const categorySlug = searchParams.get("category") || "";

  useEffect(() => {
    setLoading(true);
    api.entities.Product.list("-created_date", 200)
      .then((res) => setAllProducts(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setCategory = (slug) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set("category", slug);
    else next.delete("category");
    setSearchParams(next);
  };

  const setQuery = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("q", value);
    else next.delete("q");
    setSearchParams(next);
  };

  const filtered = useMemo(() => {
    let list = [...allProducts];
    if (categorySlug)
      list = list.filter((p) => p.category_slug === categorySlug);
    if (q) {
      const term = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.tags?.some((t) => t.toLowerCase().includes(term)),
      );
    }
    list = list.filter((p) => p.availability !== "DISCONTINUED");
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "bestselling":
        list.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
        break;
      default:
        list.sort(
          (a, b) => new Date(b.created_date) - new Date(a.created_date),
        );
    }
    return list;
  }, [allProducts, categorySlug, q, sort]);

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <SEO 
        title={activeCategory ? `${i18n.language.startsWith('ar') ? (activeCategory.name_ar || t(activeCategory.name)) : activeCategory.name} - ${t("Products")}` : q ? `${t("Search Results for")} "${q}"` : t("All Products")}
        description={activeCategory ? `${t("Browse our")} ${i18n.language.startsWith('ar') ? (activeCategory.name_ar || t(activeCategory.name)) : activeCategory.name} ${t("collection.")}` : t("Browse all our high-quality car accessories.")}
      />
      <div className="mb-8">
        <p className="font-mono-num text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
          {t("Storefront")}
        </p>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tighter">
          {activeCategory
            ? (i18n.language.startsWith('ar') ? (activeCategory.name_ar || t(activeCategory.name)) : activeCategory.name)
            : q
              ? `${t("Results for")} "${q}"`
              : t("All Products")}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {filtered.length} {t("products")}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <aside
          className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-56 shrink-0`}
        >
          <div className="md:sticky md:top-24 space-y-6">
            <div>
              <label className="font-mono-num text-[11px] tracking-wider uppercase text-muted-foreground">
                {t("Search")}
              </label>
              <input
                value={q}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("Search…")}
                className="mt-2 w-full h-10 px-3 bg-card border border-border text-sm focus:outline-none focus:border-foreground"
              />
            </div>
            <div>
              <h3 className="font-mono-num text-[11px] tracking-wider uppercase text-muted-foreground mb-3">
                {t("Categories")}
              </h3>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setCategory("")}
                  className={`text-left py-1.5 text-sm hover:text-accent ${!categorySlug ? "font-bold text-foreground" : "text-muted-foreground"}`}
                >
                  {t("All Products")}
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.slug)}
                    className={`text-left py-1.5 text-sm hover:text-accent ${categorySlug === c.slug ? "font-bold text-foreground" : "text-muted-foreground"}`}
                  >
                    {i18n.language.startsWith('ar') ? (c.name_ar || t(c.name)) : c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between gap-3 mb-6">
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="md:hidden flex items-center gap-2 px-3 py-2 border border-border text-sm"
            >
              <SlidersHorizontal className="w-4 h-4" /> {t("Filters")}
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {t("Sort:")}
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 px-3 bg-card border border-border text-sm focus:outline-none focus:border-foreground"
              >
                <option value="newest">{t("Newest")}</option>
                <option value="price-asc">{t("Price: Low to High")}</option>
                <option value="price-desc">{t("Price: High to Low")}</option>
                <option value="bestselling">{t("Best Selling")}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-heading text-xl font-semibold">
                {t("No products found")}
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                {t("Try a different search or category.")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
