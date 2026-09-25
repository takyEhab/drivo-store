import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Lock, Truck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useCart } from "@/lib/cart-context";
import { formatEGP } from "@/lib/format";

const EGYPT_GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira", "Fayoum",
  "Gharbia", "Ismailia", "Menofia", "Minya", "Qaliubiya", "New Valley",
  "Suez", "Aswan", "Assiut", "Beni Suef", "Port Said", "Damietta",
  "Sharkia", "South Sinai", "Kafr El Sheikh", "Matrouh", "Luxor",
  "North Sinai", "Sohag", "Qena"
];

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [shippingRates, setShippingRates] = useState([]);
  const [form, setForm] = useState({
    customer_name: "", phone: "", email: "",
    governorate: "", city: "", detailed_address: "", building: "", notes: "",
    coupon_code: "",
  });
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const [shippingRatesLoaded, setShippingRatesLoaded] = useState(false);

  useEffect(() => {
    base44.entities.ShippingRate.list("governorate", 100)
      .then((data) => {
        setShippingRates(data || []);
      })
      .catch(() => {})
      .finally(() => setShippingRatesLoaded(true));
  }, []);

  const rateMap = useMemo(() => {
    const map = {};
    shippingRates.forEach((r) => {
      if (r.fee !== null && r.fee >= 0) {
        map[r.governorate] = r.fee;
      }
    });
    return map;
  }, [shippingRates]);

  const availableGovernorates = useMemo(() => {
    if (shippingRatesLoaded) {
      return shippingRates
        .filter((r) => r.fee !== null && r.fee >= 0)
        .map((r) => r.governorate)
        .sort((a, b) => a.localeCompare(b));
    }
    return EGYPT_GOVERNORATES;
  }, [shippingRates, shippingRatesLoaded]);

  // If currently selected governorate is disabled, reset selection
  useEffect(() => {
    if (shippingRatesLoaded && form.governorate) {
      if (!availableGovernorates.includes(form.governorate)) {
        setForm((f) => ({ ...f, governorate: "" }));
      }
    }
  }, [availableGovernorates, form.governorate, shippingRatesLoaded]);

  const shippingFee = useMemo(() => {
    const rate = shippingRates.find((r) => r.governorate === form.governorate);
    return rate ? rate.fee : 0;
  }, [shippingRates, form.governorate]);

  const discount = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.type === "percentage") return Math.round((subtotal * coupon.value) / 100);
    return Math.min(coupon.value, subtotal);
  }, [coupon, subtotal]);

  const total = Math.max(0, subtotal - discount) + shippingFee;

  const applyCoupon = async () => {
    setCouponError("");
    setCoupon(null);
    if (!form.coupon_code.trim()) return;
    try {
      const res = await base44.entities.Coupon.filter({ code: form.coupon_code.trim(), active: true }, "-created_date", 1);
      const c = res[0];
      if (!c) { setCouponError("Invalid coupon code"); return; }
      if (c.expires_at && new Date(c.expires_at) < new Date()) { setCouponError("Coupon expired"); return; }
      if (c.min_order && subtotal < c.min_order) { setCouponError(`Minimum order ${formatEGP(c.min_order)} required`); return; }
      if (c.usage_limit && c.used_count >= c.usage_limit) { setCouponError("Coupon usage limit reached"); return; }
      setCoupon(c);
    } catch {
      setCouponError("Could not validate coupon");
    }
  };

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const placeOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    setPlacing(true);
    try {
      const orderNumber = `DRV-${Date.now().toString().slice(-6)}`;
      const order = await base44.entities.Order.create({
        order_number: orderNumber,
        status: "Pending",
        customer_name: form.customer_name,
        phone: form.phone,
        email: form.email,
        governorate: form.governorate,
        city: form.city,
        detailed_address: form.detailed_address,
        building: form.building,
        notes: form.notes,
        subtotal,
        shipping_fee: shippingFee,
        discount,
        total,
        coupon_code: coupon?.code || null,
        items: items.map((i) => ({
          product_id: i.product_id,
          name: i.name,
          slug: i.slug,
          price: i.price,
          quantity: i.quantity,
          image_url: i.image_url,
          variant: i.variant,
        })),
      });
      if (coupon) {
        await base44.entities.Coupon.update(coupon.id, { used_count: (coupon.used_count || 0) + 1 });
      }

      // Save order to device recent orders for easy tracking
      try {
        const key = "drivo_recent_orders";
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        const filtered = Array.isArray(existing)
          ? existing.filter((o) => o.order_number !== order.order_number)
          : [];
        const updated = [
          {
            order_number: order.order_number,
            phone: order.phone,
            email: order.email,
            customer_name: order.customer_name,
            total: order.total,
            created_date: order.created_date || new Date().toISOString(),
            status: order.status || "Pending",
          },
          ...filtered,
        ].slice(0, 5);
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save to localStorage", e);
      }

      setPlacedOrder(order);
      clear();
    } catch {
      alert("Could not place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 md:py-24 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-accent flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-accent-foreground" />
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tighter">Order Confirmed!</h1>
        <p className="text-muted-foreground mt-3">Thank you, {placedOrder.customer_name}. We'll call you shortly to confirm.</p>
        <div className="mt-8 border border-border bg-card p-6 inline-block">
          <p className="font-mono-num text-xs uppercase tracking-wider text-muted-foreground">Your Order Number</p>
          <p className="font-mono-num text-2xl font-bold mt-1">{placedOrder.order_number}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Saved to this device — you won't lose it if you forget the number.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() =>
              navigate(
                `/track?order=${encodeURIComponent(placedOrder.order_number)}&phone=${encodeURIComponent(placedOrder.phone)}`
              )
            }
            className="px-6 py-3 bg-foreground text-background font-heading font-bold hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Track This Order
          </button>
          <button onClick={() => navigate("/products")} className="px-6 py-3 border border-foreground font-heading font-bold hover:bg-foreground hover:text-background transition-colors">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tighter">Your cart is empty</h1>
        <p className="text-muted-foreground mt-3">Add some products before checking out.</p>
        <button onClick={() => navigate("/products")} className="mt-6 px-6 py-3 bg-foreground text-background font-heading font-bold">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tighter mb-8">Checkout</h1>
      <form onSubmit={placeOrder} className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="border border-border p-5 md:p-6 bg-card">
            <h2 className="font-heading text-lg font-bold mb-4">Contact Details</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Full Name *" value={form.customer_name} onChange={(v) => set("customer_name", v)} required />
              <Field label="Phone *" value={form.phone} onChange={(v) => set("phone", v)} required type="tel" />
              <Field label="Email" value={form.email} onChange={(v) => set("email", v)} type="email" full />
            </div>
          </div>

          <div className="border border-border p-5 md:p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold">Shipping Address</h2>
              {form.governorate && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent/10 text-accent font-heading font-semibold text-xs border border-accent/20">
                  <Truck className="w-3.5 h-3.5" />
                  Delivery: {formatEGP(shippingFee)}
                </span>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-mono-num text-[11px] tracking-wider uppercase text-muted-foreground">
                    Governorate *
                  </label>
                  {form.governorate && (
                    <span className="font-mono-num text-xs font-bold text-accent">
                      + {formatEGP(shippingFee)} delivery
                    </span>
                  )}
                </div>
                <select
                  value={form.governorate}
                  onChange={(e) => set("governorate", e.target.value)}
                  required
                  className="mt-1.5 w-full h-11 px-3 bg-background border border-border text-sm focus:outline-none focus:border-foreground"
                >
                  <option value="">Select governorate</option>
                  {availableGovernorates.map((g) => {
                    const fee = rateMap[g];
                    return (
                      <option key={g} value={g}>
                        {g} {fee !== undefined ? `— ${formatEGP(fee)}` : ""}
                      </option>
                    );
                  })}
                </select>

                {form.governorate ? (
                  <div className="mt-2.5 p-3 rounded-lg bg-accent/10 border border-accent/25 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-accent shrink-0" />
                      <span>
                        Delivery fee to <strong className="text-foreground">{form.governorate}</strong>:
                      </span>
                    </div>
                    <span className="font-mono-num font-bold text-accent text-sm">
                      {formatEGP(shippingFee)}
                    </span>
                  </div>
                ) : (
                  <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>Select your governorate to view exact delivery fees (from 50 EGP)</span>
                  </p>
                )}
              </div>
              <Field label="City / Area *" value={form.city} onChange={(v) => set("city", v)} required />
              <Field label="Building / Floor / Apt" value={form.building} onChange={(v) => set("building", v)} />
              <Field label="Detailed Address *" value={form.detailed_address} onChange={(v) => set("detailed_address", v)} required full />
              <div className="sm:col-span-2">
                <label className="font-mono-num text-[11px] tracking-wider uppercase text-muted-foreground">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={2}
                  className="mt-1.5 w-full p-3 bg-background border border-border text-sm focus:outline-none focus:border-foreground resize-none"
                  placeholder="Landmark, delivery instructions…"
                />
              </div>
            </div>
          </div>

          <div className="border border-border p-5 md:p-6 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="font-heading text-lg font-bold">Payment</h2>
            </div>
            <div className="flex items-center gap-3 p-4 bg-accent/10 border border-accent/30">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="font-heading font-bold">Cash on Delivery</p>
                <p className="text-sm text-muted-foreground">Pay in cash when your order arrives.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24 border border-border bg-card p-5 md:p-6">
            <h2 className="font-heading text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4 pr-1">
              {items.map((item) => (
                <div key={item.key} className="flex gap-3">
                  <div className="w-14 h-14 shrink-0 bg-muted overflow-hidden">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    {item.variant && <p className="text-xs text-muted-foreground">{item.variant}</p>}
                    <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <span className="font-mono-num text-sm font-bold">{formatEGP(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <input
                value={form.coupon_code}
                onChange={(e) => set("coupon_code", e.target.value)}
                placeholder="Coupon code"
                className="flex-1 h-10 px-3 bg-background border border-border text-sm font-mono-num uppercase focus:outline-none focus:border-foreground"
              />
              <button type="button" onClick={applyCoupon} className="px-4 h-10 border border-foreground text-sm font-medium hover:bg-foreground hover:text-background transition-colors">
                Apply
              </button>
            </div>
            {couponError && <p className="text-xs text-destructive -mt-2 mb-2">{couponError}</p>}
            {coupon && <p className="text-xs text-accent -mt-2 mb-2">Coupon applied: {coupon.code}</p>}

            <div className="space-y-2 pt-4 border-t border-border text-sm">
              <Row label="Subtotal" value={formatEGP(subtotal)} />
              {discount > 0 && <Row label="Discount" value={`- ${formatEGP(discount)}`} accent />}
              <Row label="Shipping" value={form.governorate ? formatEGP(shippingFee) : "Select governorate"} />
              <div className="flex justify-between pt-3 border-t border-border">
                <span className="font-heading font-bold">Total</span>
                <span className="font-mono-num text-xl font-bold">{formatEGP(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={placing || !form.governorate}
              className="mt-6 w-full h-12 bg-accent text-accent-foreground font-heading font-bold flex items-center justify-center gap-2 hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {placing ? <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" /> : "Place Order (COD)"}
            </button>
            <p className="text-xs text-muted-foreground text-center mt-3">By placing your order you agree to our terms.</p>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="font-mono-num text-[11px] tracking-wider uppercase text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1.5 w-full h-11 px-3 bg-background border border-border text-sm focus:outline-none focus:border-foreground"
      />
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? "text-accent font-medium font-mono-num" : "font-mono-num"}>{value}</span>
    </div>
  );
}