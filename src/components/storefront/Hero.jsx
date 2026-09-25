import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Truck, Headset } from "lucide-react";
import { Image } from "@/components/ui/image";

const HERO_IMG =
  "https://media.base44.com/images/public/6ab3f026d18be16d102bfefd/7895ebdee_generated_image.png";

const FEATURES = [
  { icon: Shield, label: "Premium Quality" },
  { icon: Truck, label: "Fast Delivery" },
  { icon: Headset, label: "Dedicated Support" },
];

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-background">
      {/* Right-side car imagery (desktop) */}
      <div className="absolute inset-y-0 right-0 w-full md:w-[55%] lg:w-1/2">
        <Image
          src={HERO_IMG}
          alt="Sleek black sports car with red neon lighting"
          className="w-full h-full object-cover"
          fittingType="fill"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent md:via-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Left content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-36">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-5">
            <span className="block h-[2px] w-8 bg-accent" />
            <p className="font-mono-num text-xs tracking-[0.25em] uppercase text-foreground/70">
              Premium Car Accessories
            </p>
          </div>

          <h1 className="font-heading font-bold tracking-tighter leading-[0.9] text-foreground text-5xl sm:text-6xl lg:text-7xl">
            Style Your <span className="text-accent">Ride</span>
          </h1>

          <p className="mt-5 text-foreground/70 text-base md:text-lg max-w-md">
            Premium car accessories — sourced on demand, delivered across Egypt.
          </p>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 mt-8 px-7 py-3.5 bg-accent text-accent-foreground font-heading font-bold rounded-lg hover:bg-accent/90 transition-colors"
          >
            Shop Now <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="mt-12 flex flex-wrap gap-8">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
                <span className="text-sm text-foreground/80 font-medium">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
