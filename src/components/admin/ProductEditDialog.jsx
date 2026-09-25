import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const AVAILABILITY = ["AVAILABLE", "TEMPORARILY_UNAVAILABLE", "DISCONTINUED"];

export default function ProductEditDialog({ product, onSaved, onClose }) {
  const [form, setForm] = useState(product);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(product), [product]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const updated = await base44.entities.Product.update(product.id, {
        name: form.name,
        description: form.description || "",
        price: Number(form.price),
        compare_at_price: form.compare_at_price
          ? Number(form.compare_at_price)
          : null,
        availability: form.availability,
        featured: !!form.featured,
        bestseller: !!form.bestseller,
        new_arrival: !!form.new_arrival,
      });
      onSaved(updated);
    } catch (e) {
      alert("Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="p-name">Name</Label>
            <Input
              id="p-name"
              value={form.name || ""}
              onChange={(e) => set("name", e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="p-desc">Description</Label>
            <Textarea
              id="p-desc"
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              className="mt-1.5"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="p-price">Price (EGP)</Label>
              <Input
                id="p-price"
                type="number"
                value={form.price ?? ""}
                onChange={(e) => set("price", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="p-compare">Compare-at (EGP)</Label>
              <Input
                id="p-compare"
                type="number"
                value={form.compare_at_price ?? ""}
                onChange={(e) => set("compare_at_price", e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label>Availability</Label>
            <Select
              value={form.availability}
              onValueChange={(v) => set("availability", v)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITY.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a === "TEMPORARILY_UNAVAILABLE"
                      ? "Temporarily Unavailable"
                      : a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { key: "featured", label: "Featured" },
              { key: "bestseller", label: "Best Seller" },
              { key: "new_arrival", label: "New Arrival" },
            ].map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center justify-between border border-border px-3 py-2.5"
              >
                <Label htmlFor={`p-${key}`} className="text-xs cursor-pointer">
                  {label}
                </Label>
                <Switch
                  id={`p-${key}`}
                  checked={!!form[key]}
                  onCheckedChange={(v) => set(key, v)}
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
