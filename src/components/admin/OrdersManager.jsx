import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { formatEGP } from "@/lib/format";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const STATUS_STYLE = {
  Pending: "bg-muted text-muted-foreground",
  Confirmed: "bg-accent/15 text-accent",
  Preparing: "bg-accent/15 text-accent",
  "Out for Delivery": "bg-accent/15 text-accent",
  Delivered: "bg-accent text-accent-foreground",
  Cancelled: "bg-destructive/15 text-destructive",
};

function Spinner() {
  return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
    </div>
  );
}

export default function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = () => {
    setLoading(true);
    base44.entities.Order.list("-created_date", 200)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const updateStatus = async (id, status) => {
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await base44.entities.Order.update(id, { status });
    } catch (e) {
      load();
    }
  };

  const shown =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 text-xs font-mono-num uppercase tracking-wider border transition-colors ${
            filter === "all"
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          All ({orders.length})
        </button>
        {STATUSES.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-mono-num uppercase tracking-wider border transition-colors ${
                filter === s
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      <div className="border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-10"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              shown.map((o) => (
                <TableRow key={o.id} className="border-border">
                  <TableCell className="font-mono-num font-bold">
                    {o.order_number}
                  </TableCell>
                  <TableCell className="font-medium">
                    {o.customer_name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {o.phone}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {new Date(o.created_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-mono-num font-bold">
                    {formatEGP(o.total)}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={o.status}
                      onValueChange={(v) => updateStatus(o.id, v)}
                    >
                      <SelectTrigger
                        className={`h-8 w-[150px] text-xs font-medium border-0 ${STATUS_STYLE[o.status] || ""}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
