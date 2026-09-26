import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Truck, Headset, Zap, Star } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const HERO_IMG = "/hero-car.png";

const TRUST_ITEMS = [
  { icon: Shield, labelKey: "Premium Quality" },
  { icon: Truck, labelKey: "Fast Delivery" },
  { icon: Headset, labelKey: "Dedicated Support" },
  { icon: Zap, labelKey: "Cash on Delivery" },
  { icon: Star, labelKey: "Top Rated" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function Hero() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");

  return (
    <section className="relative w-full overflow-hidden bg-background min-h-[90vh] md:min-h-[85vh] flex items-center">
      {/* Floating glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] animate-float-glow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-orange-500/8 blur-[100px] animate-float-glow pointer-events-none" style={{ animationDelay: "3s" }} />

      {/* Hero image — cinematic background */}
      <div
        className={`absolute inset-y-0 ${
          isAr ? "left-0" : "right-0"
        } w-full md:w-[60%] lg:w-[55%]`}
      >
        <Image
          src={HERO_IMG}
          alt={isAr ? "سيارة رياضية سوداء بإضاءة نيون حمراء مميزة" : "Sleek black sports car with red neon lighting"}
          className="w-full h-full object-cover scale-105"
          fittingType="fill"
        />
        {/* Multi-layer gradient overlay */}
        <div
          className={`absolute inset-0 ${
            isAr
              ? "bg-gradient-to-l from-background via-background/60 to-transparent"
              : "bg-gradient-to-r from-background via-background/60 to-transparent"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-0 bg-background/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-36 w-full">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="flex items-center gap-3 mb-6"
          >
            <span className="block h-[2px] w-10 bg-accent" />
            <p className="font-mono-num text-xs tracking-[0.25em] uppercase text-accent">
              {t("Premium Car Accessories")}
            </p>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="font-heading font-bold tracking-tighter leading-[0.88] text-foreground"
          >
            {isAr ? (
              <span className="text-5xl sm:text-6xl lg:text-8xl">
                ستايل يليق{" "}
                <span className="relative inline-block">
                  <span className="text-accent">بعربيتك</span>
                  <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-accent/50 rounded-full" />
                </span>
              </span>
            ) : (
              <span className="text-5xl sm:text-6xl lg:text-8xl">
                Style Your{" "}
                <span className="relative inline-block">
                  <span className="text-accent">Ride</span>
                  <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-accent/50 rounded-full" />
                </span>
              </span>
            )}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-6 text-foreground/60 text-base md:text-lg lg:text-xl max-w-md leading-relaxed"
          >
            {t("Premium car accessories — sourced on demand, delivered across Egypt.")}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-wrap items-center gap-4 mt-10"
          >
            <Link
              to="/products"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground font-heading font-bold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_-8px_hsl(var(--accent))]"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t("Shop Now")}
                <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
              </span>
              <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
            <Link
              to="/track"
              className="inline-flex items-center gap-2 px-8 py-4 border border-foreground/20 text-foreground font-heading font-bold rounded-lg hover:border-foreground/40 hover:bg-foreground/5 transition-all duration-300"
            >
              {t("Track Order")}
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-14 flex flex-wrap gap-8 md:gap-12"
          >
            {[
              { value: "500+", label: t("Products") },
              { value: "50+", label: t("Categories") },
              { value: "24h", label: t("Fast Delivery") },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col">
                <span className="font-heading text-2xl md:text-3xl font-bold text-foreground">{value}</span>
                <span className="font-mono-num text-[11px] tracking-wider uppercase text-foreground/50 mt-1">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Trust marquee strip */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-foreground/10 bg-background/80 backdrop-blur-sm">
        <div className="overflow-hidden py-3">
          <div className="animate-marquee flex items-center gap-12 whitespace-nowrap">
            {[...TRUST_ITEMS, ...TRUST_ITEMS].map(({ icon: Icon, labelKey }, i) => (
              <div key={`${labelKey}-${i}`} className="flex items-center gap-2.5 shrink-0">
                <Icon className="w-4 h-4 text-accent" strokeWidth={1.5} />
                <span className="text-xs text-foreground/60 font-medium tracking-wide uppercase">
                  {t(labelKey)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
