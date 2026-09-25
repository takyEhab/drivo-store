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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Star, Plus, Search } from "lucide-react";
import { Image } from "@/components/ui/image";
import ProductEditDialog from "./ProductEditDialog";

const AVAILABILITY = ["AVAILABLE", "TEMPORARILY_UNAVAILABLE", "DISCONTINUED"];

const AVAIL_STYLE = {
  AVAILABLE: "bg-accent/15 text-accent",
  TEMPORARILY_UNAVAILABLE: "bg-muted text-muted-foreground",
  DISCONTINUED: "bg-destructive/15 text-destructive",
};

function Spinner() {
  return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
    </div>
  );
}

export default function InventoryManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const load = () => {
    setLoading(true);
    base44.entities.Product.list("-created_date", 500)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const setAvailability = async (p, availability) => {
    setProducts((list) =>
      list.map((x) => (x.id === p.id ? { ...x, availability } : x)),
    );
    try {
      await base44.entities.Product.update(p.id, { availability });
    } catch {
      load();
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await base44.entities.Product.delete(p.id);
      setProducts((list) => list.filter((x) => x.id !== p.id));
    } catch {
      alert("Could not delete product.");
    }
  };

  const onSaved = (saved) => {
    setProducts((list) => {
      const exists = list.some((x) => x.id === saved.id);
      if (exists) {
        return list.map((x) => (x.id === saved.id ? saved : x));
      }
      return [saved, ...list];
    });
    setEditing(null);
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category_slug?.toLowerCase().includes(q)
    );
  });

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      {/* Top action toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 border border-border rounded-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search items by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-sm"
          />
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-muted-foreground font-mono-num">
            {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
          </span>
          <Button
            onClick={() => setEditing({ isNew: true })}
            className="h-10 font-heading font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="hidden md:table-cell">Flags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-12"
                >
                  {searchQuery ? "No matching products found." : "No products found. Click 'Add Item' to create one."}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((p) => (
                <TableRow key={p.id} className="border-border">
                  <TableCell>
                    <div className="w-12 h-12 bg-muted rounded overflow-hidden flex items-center justify-center">
                      {p.images?.[0] ? (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          fittingType="fill"
                        />
                      ) : (
                        <span className="text-[10px] text-muted-foreground select-none">No img</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[220px] truncate">
                    <p className="truncate font-semibold text-foreground">{p.name}</p>
                    {p.category_slug && (
                      <p className="text-[11px] text-muted-foreground truncate">{p.category_slug}</p>
                    )}
                  </TableCell>
                  <TableCell className="font-mono-num font-bold">
                    {formatEGP(p.price)}
                    {p.compare_at_price && (
                      <span className="block text-[11px] font-normal text-muted-foreground line-through">
                        {formatEGP(p.compare_at_price)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={p.availability}
                      onValueChange={(v) => setAvailability(p, v)}
                    >
                      <SelectTrigger
                        className={`h-8 w-[170px] text-xs font-medium border-0 ${AVAIL_STYLE[p.availability] || ""}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABILITY.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a === "TEMPORARILY_UNAVAILABLE"
                              ? "Temp. Unavailable"
                              : a === "AVAILABLE"
                              ? "Available (In Stock)"
                              : a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex gap-1.5 items-center">
                      {p.featured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                          <Star className="w-3 h-3 fill-accent text-accent" /> Featured
                        </span>
                      )}
                      {p.bestseller && (
                        <span className="font-mono-num text-[9px] tracking-wider uppercase text-accent font-bold bg-accent/10 px-1.5 py-0.5 rounded">
                          Best
                        </span>
                      )}
                      {p.new_arrival && (
                        <span className="font-mono-num text-[9px] tracking-wider uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          New
                        </span>
                      )}
                      {!p.featured && !p.bestseller && !p.new_arrival && (
                        <span className="text-xs text-muted-foreground/50">
                          —
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditing(p)}
                        aria-label="Edit"
                        title="Edit product & photos"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(p)}
                        aria-label="Delete"
                        className="hover:text-destructive"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <ProductEditDialog
          product={editing}
          onSaved={onSaved}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
