import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  MessageCircle,
  ArrowRight,
  Trash2,
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
  const [searchParams] = useSearchParams();
  const [searchMode, setSearchMode] = useState("order_phone"); // "order_phone" | "phone_email"
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [ordersList, setOrdersList] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load recent orders from this device's localStorage
  useEffect(() => {
    try {
      const key = "drivo_recent_orders";
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setRecentOrders(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Auto-fill and track if params are in URL
  useEffect(() => {
    const qOrder = searchParams.get("order");
    const qPhone = searchParams.get("phone");
    if (qOrder && qPhone) {
      setOrderNumber(qOrder);
      setPhone(qPhone);
      executeSearch(qOrder, qPhone);
    }
  }, []);

  const saveToRecent = (ord) => {
    try {
      const key = "drivo_recent_orders";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      const filtered = Array.isArray(existing)
        ? existing.filter((o) => o.order_number !== ord.order_number)
        : [];
      const updated = [
        {
          order_number: ord.order_number,
          phone: ord.phone,
          email: ord.email,
          customer_name: ord.customer_name,
          total: ord.total,
          created_date: ord.created_date || new Date().toISOString(),
          status: ord.status || "Pending",
        },
        ...filtered,
      ].slice(0, 5);
      localStorage.setItem(key, JSON.stringify(updated));
      setRecentOrders(updated);
    } catch {
      // ignore
    }
  };

  const clearRecentOrders = () => {
    try {
      localStorage.removeItem("drivo_recent_orders");
      setRecentOrders([]);
    } catch {
      // ignore
    }
  };

  const executeSearch = async (ordNum, ph) => {
    setLoading(true);
    setError("");
    setOrder(null);
    setOrdersList([]);
    try {
      const res = await base44.entities.Order.filter(
        {
          order_number: ordNum.trim(),
          phone: ph.trim(),
        },
        "-created_date",
        1,
      );
      if (res.length > 0) {
        setOrder(res[0]);
        saveToRecent(res[0]);
      } else {
        setError(
          "No order found with those details. Please check your order number and phone, or try Phone & Email search.",
        );
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setOrder(null);
    setOrdersList([]);

    if (searchMode === "order_phone") {
      if (!orderNumber.trim() || !phone.trim()) {
        setError("Please enter both your order number and phone number.");
        return;
      }
      executeSearch(orderNumber, phone);
    } else {
      // Phone & Email search (both required for privacy & security)
      if (!phone.trim() || !email.trim()) {
        setError("Please enter both your phone number and email address.");
        return;
      }
      setLoading(true);
      try {
        const res = await base44.entities.Order.filter(
          {
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
          },
          "-created_date",
          10,
        );
        if (res.length === 1) {
          setOrder(res[0]);
          saveToRecent(res[0]);
        } else if (res.length > 1) {
          setOrdersList(res);
          setOrder(res[0]);
          saveToRecent(res[0]);
        } else {
          setError(
            "No order found matching this phone number and email. Please check your details or message us on WhatsApp.",
          );
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const trackRecent = (rec) => {
    setSearchMode("order_phone");
    setOrderNumber(rec.order_number);
    setPhone(rec.phone || "");
    if (rec.phone) {
      executeSearch(rec.order_number, rec.phone);
    }
  };

  const currentStep = order ? STATUSES.indexOf(order.status) : -1;
  const isCancelled = order?.status === "Cancelled";

  const whatsappPhone = "201097132814";
  const whatsappMessage = phone.trim()
    ? `Hi Drivo, I forgot my order number. My phone number is ${phone.trim()}. Could you please help me track my order?`
    : `Hi Drivo, I forgot my order number and need help tracking my order.`;
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center mb-8">
        <p className="font-mono-num text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
          Order Tracking
        </p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tighter">
          Track Your Order
        </h1>
        <p className="text-muted-foreground mt-3 text-sm md:text-base">
          Check live shipping and delivery updates in real-time.
        </p>
      </div>

      {/* Recent Orders on This Device */}
      {recentOrders.length > 0 && !order && (
        <div className="mb-8 p-5 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              <span className="font-heading text-sm font-semibold">
                Saved on this device
              </span>
            </div>
            <button
              type="button"
              onClick={clearRecentOrders}
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
              title="Clear saved device history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {recentOrders.map((rec) => (
              <button
                key={rec.order_number}
                type="button"
                onClick={() => trackRecent(rec)}
                className="p-3.5 text-left border border-border/80 bg-background/60 hover:bg-accent/10 hover:border-accent transition-all rounded-xl flex items-center justify-between group"
              >
                <div>
                  <p className="font-mono-num font-bold text-sm text-foreground group-hover:text-accent transition-colors">
                    {rec.order_number}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatEGP(rec.total)} • <span className="font-medium text-foreground">{rec.status}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-accent transition-colors">
                  <span className="hidden sm:inline">Track</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Mode Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          type="button"
          onClick={() => {
            setSearchMode("order_phone");
            setError("");
          }}
          className={classNames(
            "flex-1 pb-3 text-sm font-heading font-semibold transition-colors border-b-2 -mb-px text-center",
            searchMode === "order_phone"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Order # & Phone
        </button>
        <button
          type="button"
          onClick={() => {
            setSearchMode("phone_email");
            setError("");
          }}
          className={classNames(
            "flex-1 pb-3 text-sm font-heading font-semibold transition-colors border-b-2 -mb-px text-center flex items-center justify-center gap-1.5",
            searchMode === "phone_email"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <span>Forgot Order #</span>
          <span className="text-xs text-muted-foreground font-normal">(Phone & Email)</span>
        </button>
      </div>

      <form onSubmit={handleSearch} className="grid sm:grid-cols-2 gap-3 mb-8">
        {searchMode === "order_phone" ? (
          <>
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Order Number (e.g. DRV-12345)"
              className="h-12 px-4 bg-card border border-border text-sm focus:outline-none focus:border-foreground font-mono-num rounded-lg"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number (e.g. 010xxxxxxxx)"
              className="h-12 px-4 bg-card border border-border text-sm focus:outline-none focus:border-foreground font-mono-num rounded-lg"
            />
          </>
        ) : (
          <>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number (e.g. 010xxxxxxxx)"
              className="h-12 px-4 bg-card border border-border text-sm focus:outline-none focus:border-foreground font-mono-num rounded-lg"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email used at checkout"
              className="h-12 px-4 bg-card border border-border text-sm focus:outline-none focus:border-foreground rounded-lg"
            />
          </>
        )}
        <button
          type="submit"
          disabled={loading}
          className="sm:col-span-2 h-12 bg-foreground text-background font-heading font-bold flex items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors rounded-lg shadow-sm"
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

      {/* Multiple Orders Found Selector (Phone & Email Mode) */}
      {ordersList.length > 1 && (
        <div className="mb-6 p-4 border border-border bg-muted/40 rounded-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Found {ordersList.length} orders for your account. Select one:
          </p>
          <div className="flex flex-wrap gap-2">
            {ordersList.map((o) => (
              <button
                key={o.order_number}
                type="button"
                onClick={() => setOrder(o)}
                className={classNames(
                  "px-3.5 py-2 text-xs font-mono-num font-semibold border rounded-lg transition-colors",
                  order?.order_number === o.order_number
                    ? "bg-foreground text-background border-foreground shadow-sm"
                    : "bg-card text-foreground border-border hover:border-foreground"
                )}
              >
                {o.order_number} • {formatEGP(o.total)} • {o.status}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="text-center py-8 px-4 border border-border bg-card rounded-xl mb-6">
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      )}

      {order && (
        <div className="border border-border bg-card p-6 md:p-8 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-6 pb-6 border-b border-border">
            <div>
              <p className="font-mono-num text-xs text-muted-foreground uppercase tracking-wider">
                Order Number
              </p>
              <p className="font-mono-num text-xl font-bold text-foreground">
                {order.order_number}
              </p>
              {order.customer_name && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Recipient: {order.customer_name}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-mono-num text-xs text-muted-foreground uppercase tracking-wider">
                Total
              </p>
              <p className="font-mono-num text-xl font-bold text-accent">
                {formatEGP(order.total)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {order.governorate ? `${order.governorate}, Egypt` : "Cash on Delivery"}
              </p>
            </div>
          </div>

          {/* Timeline */}
          {isCancelled ? (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
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
            <div className="relative py-2">
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
                          ? "bg-accent border-accent text-accent-foreground shadow-sm"
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
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-muted-foreground">
                    <strong className="text-foreground font-medium">{item.name}</strong>{" "}
                    {item.variant ? `(${item.variant})` : ""} × {item.quantity}
                  </span>
                  <span className="font-mono-num font-semibold text-foreground">
                    {formatEGP(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Help Fallback Banner */}
      <div className="mt-10 p-5 rounded-2xl border border-border/80 bg-muted/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm">
              Lost your order number or need help?
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Contact our support team on WhatsApp and we will find your order in seconds.
            </p>
          </div>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-heading font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}
