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
import { Pencil, Trash2, Star } from "lucide-react";
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
    } catch (e) {
      load();
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await base44.entities.Product.delete(p.id);
      setProducts((list) => list.filter((x) => x.id !== p.id));
    } catch (e) {
      alert("Could not delete product.");
    }
  };

  const onSaved = (saved) => {
    setProducts((list) => list.map((x) => (x.id === saved.id ? saved : x)));
    setEditing(null);
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="border border-border bg-card overflow-hidden">
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
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-10"
                >
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id} className="border-border">
                  <TableCell>
                    <div className="w-12 h-12 bg-muted overflow-hidden">
                      {p.images?.[0] && (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          fittingType="fill"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[220px] truncate">
                    {p.name}
                  </TableCell>
                  <TableCell className="font-mono-num font-bold">
                    {formatEGP(p.price)}
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
                              : a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex gap-1.5">
                      {p.featured && (
                        <Star className="w-4 h-4 fill-accent text-accent" />
                      )}
                      {p.bestseller && (
                        <span className="font-mono-num text-[9px] tracking-wider uppercase text-accent">
                          Best
                        </span>
                      )}
                      {p.new_arrival && (
                        <span className="font-mono-num text-[9px] tracking-wider uppercase text-muted-foreground">
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
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(p)}
                        aria-label="Delete"
                        className="hover:text-destructive"
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
