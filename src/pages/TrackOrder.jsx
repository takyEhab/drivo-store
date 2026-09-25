import React, { useState } from "react";
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatEGP, classNames } from "@/lib/format";

const STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
];

const STATUS_META = {
  Pending: { icon: Clock, label: "Order Placed" },
  Confirmed: { icon: CheckCircle2, label: "Confirmed" },
  Preparing: { icon: Package, label: "Preparing" },
  "Out for Delivery": { icon: Truck, label: "Out for Delivery" },
  Delivered: { icon: CheckCircle2, label: "Delivered" },
  Cancelled: { icon: XCircle, label: "Cancelled" },
};

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    setSearched(true);
    try {
      const res = await base44.entities.Order.filter(
        {
          order_number: orderNumber.trim(),
          phone: phone.trim(),
        },
        "-created_date",
        1,
      );
      if (res.length > 0) {
        setOrder(res[0]);
      } else {
        setError(
          "No order found with those details. Please check your order number and phone.",
        );
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? STATUSES.indexOf(order.status) : -1;
  const isCancelled = order?.status === "Cancelled";

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center mb-10">
        <p className="font-mono-num text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
          Order Tracking
        </p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tighter">
          Track Your Order
        </h1>
        <p className="text-muted-foreground mt-3">
          Enter your order number and phone to see live status.
        </p>
      </div>

      <form onSubmit={handleSearch} className="grid sm:grid-cols-2 gap-3 mb-10">
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Order Number (e.g. DRV-12345)"
          className="h-12 px-4 bg-card border border-border text-sm focus:outline-none focus:border-foreground font-mono-num"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
          className="h-12 px-4 bg-card border border-border text-sm focus:outline-none focus:border-foreground font-mono-num"
        />
        <button
          type="submit"
          disabled={loading}
          className="sm:col-span-2 h-12 bg-foreground text-background font-heading font-bold flex items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
          ) : (
            <>
              <Search className="w-4 h-4" /> Track Order
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="text-center py-10 border border-border bg-card">
          <p className="text-muted-foreground">{error}</p>
        </div>
      )}

      {order && (
        <div className="border border-border bg-card p-6 md:p-8">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-6 pb-6 border-b border-border">
            <div>
              <p className="font-mono-num text-xs text-muted-foreground uppercase tracking-wider">
                Order
              </p>
              <p className="font-mono-num text-xl font-bold">
                {order.order_number}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono-num text-xs text-muted-foreground uppercase tracking-wider">
                Total
              </p>
              <p className="font-mono-num text-xl font-bold">
                {formatEGP(order.total)}
              </p>
            </div>
          </div>

          {/* Timeline */}
          {isCancelled ? (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30">
              <XCircle className="w-6 h-6 text-destructive" />
              <div>
                <p className="font-heading font-bold text-destructive">
                  Order Cancelled
                </p>
                <p className="text-sm text-muted-foreground">
                  This order has been cancelled. Contact support for help.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {STATUSES.map((status, i) => {
                const Icon = STATUS_META[status].icon;
                const done = i <= currentStep;
                const current = i === currentStep;
                return (
                  <div
                    key={status}
                    className="flex gap-4 pb-8 last:pb-0 relative"
                  >
                    {i < STATUSES.length - 1 && (
                      <div
                        className={classNames(
                          "absolute left-5 top-10 bottom-0 w-px",
                          done ? "bg-accent" : "bg-border",
                        )}
                      />
                    )}
                    <div
                      className={classNames(
                        "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors",
                        done
                          ? "bg-accent border-accent text-accent-foreground"
                          : "bg-card border-border text-muted-foreground",
                        current && "ring-4 ring-accent/20",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="pt-1.5">
                      <p
                        className={classNames(
                          "font-heading font-semibold",
                          done ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {STATUS_META[status].label}
                      </p>
                      {current && (
                        <p className="text-sm text-accent font-medium mt-0.5">
                          Current status
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Items */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="font-mono-num text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Items
            </p>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>
                    {item.name} {item.variant ? `(${item.variant})` : ""} ×{" "}
                    {item.quantity}
                  </span>
                  <span className="font-mono-num">
                    {formatEGP(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!order && !error && !searched && (
        <div className="text-center py-10 text-muted-foreground text-sm">
          Your order status will appear here.
        </div>
      )}
    </div>
  );
}
