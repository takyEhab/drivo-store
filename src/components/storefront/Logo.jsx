import React from "react";
import { Link } from "react-router-dom";

export default function Logo({ tagline = false, to = "/", className = "" }) {
  return (
    <Link
      to={to}
      aria-label="Drivo — Drive Better"
      className={`flex items-center gap-2.5 leading-none ${className}`}
    >
      <span className="flex items-end gap-[3px] h-6" aria-hidden="true">
        <span className="block w-[3px] h-full bg-accent skew-x-12" />
        <span className="block w-[3px] h-3.5 bg-accent/70 skew-x-12" />
      </span>
      <span className="flex flex-col">
        <span className="font-heading text-2xl font-bold tracking-tighter text-foreground">
          DRIVO
        </span>
        {tagline && (
          <span className="font-mono-num text-[8px] tracking-[0.35em] uppercase text-muted-foreground mt-0.5">
            Drive Better
          </span>
        )}
      </span>
    </Link>
  );
}
