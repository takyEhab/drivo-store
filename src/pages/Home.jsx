import React, { useEffect, useState, useRef } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ArrowRight, ChevronRight, Sparkles, TrendingUp, Tag, Package } from "lucide-react";
import { api } from "@/api/apiClient";
import ProductCard from "@/components/storefront/ProductCard";
import { Image } from "@/components/ui/image";
import Hero from "@/components/storefront/Hero";
import SEO from "@/components/SEO";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion";

/* ─── Animation variants ─── */
const sectionFade = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardFade = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/* ─── Animated section wrapper ─── */
function AnimatedSection({ children, className = "", ...props }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      variants={sectionFade}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  );
}

/* ─── Section header component ─── */
function SectionHeader({ number, label, title, subtitle, viewAllLink, isAr, t }) {
  return (
    <div className="flex items-end justify-between mb-10">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-accent/30 text-accent">
            <span className="font-mono-num text-[10px] font-bold">{number}</span>
          </span>
          <span className="font-mono-num text-xs tracking-[0.2em] uppercase text-accent">
            {label}
          </span>
        </div>
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
          {title}
        </h2>
        {subtitle && (
          <p className="text-foreground/50 text-sm mt-2 max-w-md">{subtitle}</p>
        )}
      </div>
      {viewAllLink && (
        <Link
          to={viewAllLink}
          className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-foreground/60 hover:text-accent transition-colors group"
        >
          {t("View all")}
          <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${isAr ? "rotate-180 group-hover:-translate-x-0.5" : ""}`} />
        </Link>
      )}
    </div>
  );
}

/* ─── Product grid with staggered animation ─── */
function ProductGrid({ products }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5"
    >
      {products.map((p) => (
        <motion.div key={p.id} variants={cardFade}>
          <ProductCard product={p} />
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ─── Main Home Page ─── */
export default function Home() {
  const { categories } = useOutletContext();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.entities.Product.list("-created_date", 100)
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

      {/* ═══ HERO ═══ */}
      <Hero />

      {/* ═══ CATEGORIES ═══ */}
      {categories.length > 0 && (
        <AnimatedSection className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <SectionHeader
            number="01"
            label={t("Categories")}
            title={t("Browse by Category")}
            isAr={isAr}
            t={t}
          />
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5"
          >
            {categories.map((c) => (
              <motion.div key={c.id} variants={cardFade}>
                <Link
                  to={`/products?category=${c.slug}`}
                  className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-muted"
                >
                  {c.image_url && (
                    <Image
                      src={c.image_url}
                      alt={c.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                      fittingType="fill"
                    />
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {/* Hover glow overlay */}
                  <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors duration-500" />
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-heading text-lg md:text-xl font-bold text-white">
                      {i18n.language.startsWith("ar") ? (c.name_ar || t(c.name)) : c.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-2 overflow-hidden">
                      <span className="font-mono-num text-[11px] text-accent translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1">
                        {t("Shop now")} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 right-0 w-[2px] h-6 bg-accent" />
                    <div className="absolute top-0 right-0 h-[2px] w-6 bg-accent" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatedSection>
      )}

      {/* ═══ FEATURED ═══ */}
      {featured.length > 0 && (
        <AnimatedSection className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <SectionHeader
            number="02"
            label={t("Featured")}
            title={t("Featured Upgrades")}
            viewAllLink="/products"
            isAr={isAr}
            t={t}
          />
          <ProductGrid products={featured} />
        </AnimatedSection>
      )}

      {/* ═══ BEST SELLERS ═══ */}
      {bestsellers.length > 0 && (
        <AnimatedSection className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <SectionHeader
            number="03"
            label={t("Trending")}
            title={t("Best Sellers")}
            isAr={isAr}
            t={t}
          />
          <ProductGrid products={bestsellers} />
        </AnimatedSection>
      )}

      {/* ═══ UNDER 100 EGP — Full-width dark section ═══ */}
      {under100.length > 0 && (
        <div className="relative my-16 md:my-24">
          {/* Background decoration */}
          <div className="absolute inset-0 gradient-mesh" />
          <div className="absolute inset-0 noise-overlay" />

          <AnimatedSection className="relative z-10 bg-card/60 backdrop-blur-sm border-y border-border py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <SectionHeader
                number="04"
                label={t("Budget")}
                title={t("Under 100 EGP")}
                subtitle={t("Small upgrades, big difference.")}
                isAr={isAr}
                t={t}
              />
              <ProductGrid products={under100} />
            </div>
          </AnimatedSection>
        </div>
      )}

      {/* ═══ NEW ARRIVALS ═══ */}
      {newArrivals.length > 0 && (
        <AnimatedSection className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <SectionHeader
            number="05"
            label={t("Fresh")}
            title={t("New Arrivals")}
            viewAllLink="/products"
            isAr={isAr}
            t={t}
          />
          <ProductGrid products={newArrivals} />
        </AnimatedSection>
      )}

      {/* ═══ LOADING ═══ */}
      {loading && (
        <div className="mx-auto max-w-7xl px-4 py-24 flex justify-center">
          <div className="w-8 h-8 border-4 border-muted border-t-accent rounded-full animate-spin" />
        </div>
      )}

      {/* ═══ VALUE PROPS STRIP ═══ */}
      <AnimatedSection className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: Package, title: t("Fast Delivery"), desc: t("Across all of Egypt") },
            { icon: Tag, title: t("Cash on Delivery"), desc: t("Pay when you receive") },
            { icon: TrendingUp, title: t("Premium Quality"), desc: t("Top-tier accessories") },
            { icon: Sparkles, title: t("New Arrivals"), desc: t("Updated weekly") },
          ].map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-card rounded-xl p-6 text-center group cursor-default hover:border-accent/20 transition-colors duration-300"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent mb-4 group-hover:bg-accent/20 transition-colors">
                <Icon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-heading text-sm font-bold mb-1">{title}</h3>
              <p className="font-mono-num text-[11px] text-foreground/40">{desc}</p>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ═══ CTA BANNER ═══ */}
      <AnimatedSection className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="relative overflow-hidden rounded-2xl gradient-mesh">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-accent/10 blur-[80px] -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-orange-500/10 blur-[60px] translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10 border border-border/50 rounded-2xl p-10 md:p-20 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="font-mono-num text-xs tracking-[0.25em] uppercase text-accent mb-4">
                {t("Premium Car Accessories")}
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-6xl font-bold tracking-tighter leading-tight">
                {t("Ready to style your ride?")}
              </h2>
              <p className="text-foreground/50 mt-5 max-w-lg mx-auto text-sm md:text-base">
                {t("Cash on Delivery across Egypt. Track your order in real time.")}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                <Link
                  to="/products"
                  className="group relative inline-flex items-center gap-2 px-10 py-4 bg-accent text-accent-foreground font-heading font-bold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_-10px_hsl(var(--accent))]"
                >
                  <span className="relative z-10">{t("Start Shopping")}</span>
                  <ArrowRight className={`relative z-10 w-4 h-4 transition-transform group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
                  <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
