import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/storefront/Logo";

export default function Footer({ categories = [] }) {
  return (
    <footer className="relative bg-background text-foreground mt-24 overflow-hidden border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="col-span-2 md:col-span-1">
            <Logo tagline className="mb-4" />
            <p className="text-sm text-foreground/60 max-w-[200px]">
              Style your ride. Premium car accessories delivered across Egypt.
            </p>
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold mb-4">Shop</h3>
            <ul className="space-y-2.5 text-sm text-foreground/70">
              <li>
                <Link to="/products" className="hover:text-accent">
                  All Products
                </Link>
              </li>
              {categories.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/products?category=${c.slug}`}
                    className="hover:text-accent"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold mb-4">Support</h3>
            <ul className="space-y-2.5 text-sm text-foreground/70">
              <li>
                <Link to="/track" className="hover:text-accent">
                  Track Order
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/201097132814"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent"
                >
                  WhatsApp Us
                </a>
              </li>
              <li>
                <span className="cursor-default">Cash on Delivery</span>
              </li>
              <li>
                <span className="cursor-default">Shipping Info</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold mb-4">Drivo</h3>
            <ul className="space-y-2.5 text-sm text-foreground/70">
              <li>
                <span className="cursor-default">About Us</span>
              </li>
              <li>
                <span className="cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="cursor-default">Terms of Service</span>
              </li>
              <li>
                <Link to="/admin" className="hover:text-accent">
                  Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-foreground/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-foreground/50 font-mono-num">
            © {new Date().getFullYear()} DRIVO. All rights reserved.
          </p>
          <p className="text-xs text-foreground/50 font-mono-num">
            Style Your Ride — Egypt
          </p>
        </div>
      </div>

      {/* Massive cropped logo */}
      <div className="select-none pointer-events-none" aria-hidden="true">
        <div className="font-heading font-bold tracking-tighter leading-none text-foreground/5 text-[22vw] -mb-[4vw] text-center">
          DRIVO
        </div>
      </div>
    </footer>
  );
}
