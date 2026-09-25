import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Menu, X, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "@/lib/cart-context";
import Logo from "@/components/storefront/Logo";

export default function Navbar({ categories = [] }) {
  const { t, i18n } = useTranslation();
  const { count, openDrawer } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('ar') ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/products?q=${encodeURIComponent(query.trim())}`);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Logo />

            <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
              <Link
                to="/products"
                className="hover:text-accent transition-colors"
              >
                {t("All Products")}
              </Link>
              {categories.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  to={`/products?category=${c.slug}`}
                  className="hover:text-accent transition-colors"
                >
                  {i18n.language.startsWith('ar') ? (c.name_ar || t(c.name)) : c.name}
                </Link>
              ))}
            </nav>

            <form
              onSubmit={submitSearch}
              className="hidden md:flex items-center flex-1 max-w-xs"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("Search accessories…")}
                  className="w-full h-10 pl-9 pr-3 bg-muted border border-border text-sm focus:outline-none focus:border-foreground"
                />
              </div>
            </form>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleLanguage}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold hover:bg-muted transition-colors rounded-md border border-border/50 mr-2"
                aria-label="Toggle language"
              >
                <Globe className="w-3.5 h-3.5" />
                {i18n.language.startsWith('ar') ? 'EN' : 'عربي'}
              </button>
              <button
                onClick={openDrawer}
                className="relative p-2 hover:bg-muted transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-accent text-accent-foreground font-mono-num text-[10px] font-bold rounded-full">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-out menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-background shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Logo />
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="p-2 -mr-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium">Language</span>
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-muted hover:bg-muted/80 transition-colors rounded-md border border-border/50"
              >
                <Globe className="w-3.5 h-3.5" />
                {i18n.language.startsWith('ar') ? 'English' : 'العربية'}
              </button>
            </div>
            <form
              onSubmit={submitSearch}
              className="p-4 border-b border-border"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("Search accessories…")}
                  className="w-full h-11 pl-9 pr-3 bg-muted border border-border text-sm focus:outline-none focus:border-foreground"
                />
              </div>
            </form>
            <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
              <Link
                to="/products"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-3 hover:bg-muted font-medium"
              >
                {t("All Products")}
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/products?category=${c.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 px-3 hover:bg-muted font-medium"
                >
                  {i18n.language.startsWith('ar') ? (c.name_ar || t(c.name)) : c.name}
                </Link>
              ))}
              <Link
                to="/track"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-3 hover:bg-muted font-medium text-muted-foreground"
              >
                {t("Track Order")}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
