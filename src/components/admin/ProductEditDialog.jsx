import React, { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/lib/supabase";
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
import {
  Upload,
  ImagePlus,
  Trash2,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";

const AVAILABILITY = ["AVAILABLE", "TEMPORARILY_UNAVAILABLE", "DISCONTINUED"];

async function uploadPhotoFile(file) {
  const fileExt = file.name.split(".").pop();
  const cleanExt = (fileExt || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const fileName = `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${cleanExt}`;

  // 1. Try Supabase storage 'products' bucket
  try {
    const { data, error } = await supabase.storage
      .from("products")
      .upload(fileName, file, { cacheControl: "3600", upsert: true });

    if (!error && data) {
      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);
      if (urlData?.publicUrl) {
        return urlData.publicUrl;
      }
    }
  } catch (err) {
    console.warn("Storage upload to 'products' failed, trying fallback", err);
  }

  // 2. Try Supabase storage 'product-images' bucket
  try {
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { cacheControl: "3600", upsert: true });

    if (!error && data) {
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);
      if (urlData?.publicUrl) {
        return urlData.publicUrl;
      }
    }
  } catch (err) {
    console.warn("Storage upload to 'product-images' failed, falling back to data URL", err);
  }

  // 3. Fallback: Compress and read as Data URL so image always saves without failing
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1200;
        let { width, height } = img;
        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => resolve(event.target.result);
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProductEditDialog({ product, onSaved, onClose }) {
  const isNew = !product?.id || product?.isNew;

  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: product?.price ?? "",
    compare_at_price: product?.compare_at_price ?? "",
    category_id: product?.category_id || "",
    category_slug: product?.category_slug || "",
    availability: product?.availability || "AVAILABLE",
    featured: !!product?.featured,
    bestseller: !!product?.bestseller,
    new_arrival: product?.new_arrival !== undefined ? !!product?.new_arrival : true,
    images: Array.isArray(product?.images) ? [...product.images] : [],
  });

  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        price: product.price ?? "",
        compare_at_price: product.compare_at_price ?? "",
        category_id: product.category_id || "",
        category_slug: product.category_slug || "",
        availability: product.availability || "AVAILABLE",
        featured: !!product.featured,
        bestseller: !!product.bestseller,
        new_arrival: product.new_arrival !== undefined ? !!product.new_arrival : true,
        images: Array.isArray(product.images) ? [...product.images] : [],
      });
    }
  }, [product]);

  useEffect(() => {
    base44.entities.Category.list("name", 100)
      .then(setCategories)
      .catch(() => {});
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleNameChange = (name) => {
    setForm((f) => {
      const prevAutoSlug = f.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const shouldUpdateSlug = isNew && (!f.slug || f.slug === prevAutoSlug);
      const newSlug = shouldUpdateSlug
        ? name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
        : f.slug;

      return { ...f, name, slug: newSlug };
    });
  };

  const handleCategoryChange = (categoryId) => {
    const selectedCat = categories.find((c) => c.id === categoryId);
    setForm((f) => ({
      ...f,
      category_id: categoryId === "none" ? null : categoryId,
      category_slug: selectedCat ? selectedCat.slug : null,
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const url = await uploadPhotoFile(file);
        if (url) uploadedUrls.push(url);
      }
      if (uploadedUrls.length > 0) {
        setForm((f) => ({
          ...f,
          images: [...(f.images || []), ...uploadedUrls],
        }));
      }
    } catch (err) {
      alert("Failed to upload photo: " + (err.message || "Unknown error"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    setForm((f) => ({
      ...f,
      images: [...(f.images || []), urlInput.trim()],
    }));
    setUrlInput("");
    setShowUrlInput(false);
  };

  const removeImage = (index) => {
    setForm((f) => ({
      ...f,
      images: f.images.filter((_, i) => i !== index),
    }));
  };

  const setCoverImage = (index) => {
    if (index === 0) return;
    setForm((f) => {
      const copy = [...f.images];
      const [item] = copy.splice(index, 1);
      return { ...f, images: [item, ...copy] };
    });
  };

  const save = async () => {
    if (!form.name.trim()) {
      alert("Please enter a product name.");
      return;
    }
    if (form.price === "" || Number(form.price) < 0) {
      alert("Please enter a valid price.");
      return;
    }

    setSaving(true);
    try {
      const generatedSlug = (form.slug || form.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `item-${Date.now()}`;

      if (isNew) {
        const payload = {
          name: form.name.trim(),
          slug: generatedSlug,
          description: form.description || "",
          price: Number(form.price),
          compare_at_price: form.compare_at_price
            ? Number(form.compare_at_price)
            : null,
          category_id: form.category_id || null,
          category_slug: form.category_slug || null,
          availability: form.availability || "AVAILABLE",
          featured: !!form.featured,
          bestseller: !!form.bestseller,
          new_arrival: !!form.new_arrival,
          images: Array.isArray(form.images) ? form.images : [],
          variants: [],
          tags: [],
        };
        const created = await base44.entities.Product.create(payload);
        onSaved(created);
      } else {
        const payload = {
          name: form.name.trim(),
          slug: generatedSlug,
          description: form.description || "",
          price: Number(form.price),
          compare_at_price: form.compare_at_price
            ? Number(form.compare_at_price)
            : null,
          category_id: form.category_id || null,
          category_slug: form.category_slug || null,
          availability: form.availability || "AVAILABLE",
          featured: !!form.featured,
          bestseller: !!form.bestseller,
          new_arrival: !!form.new_arrival,
          images: Array.isArray(form.images) ? form.images : [],
        };
        const updated = await base44.entities.Product.update(product.id, payload);
        onSaved(updated);
      }
    } catch (e) {
      alert("Could not save product: " + (e.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">
            {isNew ? "Add New Item" : "Edit Item"}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {isNew
              ? "Add a new accessory to your store inventory."
              : `Updating details for "${product?.name}".`}
          </p>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Photo Upload Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Product Photos</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-xs h-7 px-2"
                >
                  <LinkIcon className="w-3.5 h-3.5 mr-1" />
                  {showUrlInput ? "Hide URL" : "Add via URL"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs h-7 px-2.5 font-medium"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 mr-1" />
                      Upload Photo
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {showUrlInput && (
              <div className="flex gap-2 p-2 bg-muted/40 rounded-lg border border-border">
                <Input
                  placeholder="Paste image URL (https://...)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="h-8 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddUrl}
                  className="h-8 px-3 text-xs"
                >
                  Add
                </Button>
              </div>
            )}

            {form.images && form.images.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 p-3 rounded-xl border border-border bg-muted/20">
                {form.images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-lg overflow-hidden border border-border bg-card aspect-square"
                  >
                    <img
                      src={imgUrl}
                      alt={`Product ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-foreground text-background text-[10px] font-bold rounded shadow-sm">
                        Cover
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => setCoverImage(idx)}
                          className="px-1.5 py-1 rounded bg-background/90 hover:bg-background text-foreground text-[10px] font-semibold transition-colors shadow-sm"
                          title="Set as Cover Photo"
                        >
                          Make Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-1 rounded bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-foreground/50 transition-colors bg-muted/10"
              >
                <ImagePlus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs font-semibold text-foreground">
                  Click to upload product photo
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Supports JPG, PNG, WEBP — you can upload multiple photos
                </p>
              </div>
            )}
          </div>

          {/* Product Name & Slug */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="p-name">Product Name *</Label>
              <Input
                id="p-name"
                placeholder="e.g. Carbon Fiber Steering Wheel"
                value={form.name || ""}
                onChange={(e) => handleNameChange(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="p-slug">URL Slug</Label>
              <Input
                id="p-slug"
                placeholder="e.g. carbon-fiber-steering-wheel"
                value={form.slug || ""}
                onChange={(e) => set("slug", e.target.value)}
                className="mt-1.5 font-mono text-xs"
              />
            </div>
          </div>

          {/* Category & Availability */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select
                value={form.category_id || "none"}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Availability Status</Label>
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
                        : a === "AVAILABLE"
                        ? "Available (In Stock)"
                        : "Discontinued"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="p-price">Price (EGP) *</Label>
              <Input
                id="p-price"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 750"
                value={form.price ?? ""}
                onChange={(e) => set("price", e.target.value)}
                className="mt-1.5 font-mono-num font-semibold"
                required
              />
            </div>
            <div>
              <Label htmlFor="p-compare">Compare-at Price (EGP)</Label>
              <Input
                id="p-compare"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 950 (optional discount)"
                value={form.compare_at_price ?? ""}
                onChange={(e) => set("compare_at_price", e.target.value)}
                className="mt-1.5 font-mono-num"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="p-desc">Description</Label>
            <Textarea
              id="p-desc"
              placeholder="Detailed description of features, materials, fitment..."
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              className="mt-1.5"
              rows={3}
            />
          </div>

          {/* Flags */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              { key: "featured", label: "Featured" },
              { key: "bestseller", label: "Best Seller" },
              { key: "new_arrival", label: "New Arrival" },
            ].map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center justify-between border border-border px-3 py-2.5 rounded-lg bg-card"
              >
                <Label htmlFor={`p-${key}`} className="text-xs cursor-pointer font-medium">
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

        <DialogFooter className="pt-4 border-t border-border mt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || uploading} className="font-semibold">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isNew ? "Creating…" : "Saving…"}
              </>
            ) : isNew ? (
              "Create Item"
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
