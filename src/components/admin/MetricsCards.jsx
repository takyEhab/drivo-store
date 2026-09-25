import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { formatEGP } from "@/lib/format";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  Clock,
  MousePointerClick,
  XCircle,
} from "lucide-react";

function Spinner() {
  return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
    </div>
  );
}

export default function MetricsCards() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      base44.entities.Order.list("-created_date", 500).catch(() => []),
      base44.entities.Product.list("-created_date", 500).catch(() => []),
      base44.entities.ProductEvent.filter(
        { type: "add_to_cart" },
        "-created_date",
        500,
      ).catch(() => []),
    ]).then(([orders, products, events]) => {
      if (!active) return;
      const revenue = orders
        .filter((o) => o.status !== "Cancelled")
        .reduce((s, o) => s + (o.total || 0), 0);
      const pending = orders.filter((o) => o.status === "Pending").length;
      const unavailable = products.filter(
        (p) => p.availability !== "AVAILABLE",
      ).length;
      setData({ orders, products, events, revenue, pending, unavailable });
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Spinner />;
  if (!data) return null;

  const cards = [
    { label: "Total Orders", value: data.orders.length, icon: ShoppingCart },
    {
      label: "Revenue",
      value: formatEGP(data.revenue),
      icon: TrendingUp,
      accent: true,
    },
    { label: "Pending Orders", value: data.pending, icon: Clock },
    { label: "Products", value: data.products.length, icon: Package },
    {
      label: "Add to Cart Events",
      value: data.events.length,
      icon: MousePointerClick,
      accent: true,
    },
    { label: "Unavailable Items", value: data.unavailable, icon: XCircle },
  ];

  const recentEvents = data.events.slice(0, 6);
  const recentOrders = data.orders.slice(0, 6);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <Icon
                  className={`w-5 h-5 ${c.accent ? "text-accent" : "text-muted-foreground"}`}
                  strokeWidth={1.5}
                />
              </div>
              <p className="font-mono-num text-2xl font-bold tracking-tighter">
                {c.value}
              </p>
              <p className="font-mono-num text-[10px] tracking-wider uppercase text-muted-foreground mt-1">
                {c.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-border bg-card p-5">
          <h2 className="font-heading text-lg font-bold mb-4">
            Recent Add-to-Cart Events
          </h2>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentEvents.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {e.product_name || "Unknown product"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.created_date).toLocaleString()} · Qty{" "}
                      {e.quantity || 1}
                      {e.variant ? ` · ${e.variant}` : ""}
                    </p>
                  </div>
                  <span className="font-mono-num text-[10px] tracking-wider uppercase text-accent shrink-0 ml-3">
                    {e.type.replace("_", " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-border bg-card p-5">
          <h2 className="font-heading text-lg font-bold mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {o.order_number} · {o.customer_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_date).toLocaleDateString()} ·{" "}
                      {o.status}
                    </p>
                  </div>
                  <span className="font-mono-num font-bold shrink-0 ml-3">
                    {formatEGP(o.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
