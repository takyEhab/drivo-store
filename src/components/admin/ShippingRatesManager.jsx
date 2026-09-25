import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { formatEGP, classNames } from "@/lib/format";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Truck,
  Search,
  Pencil,
  Check,
  X,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const GOVERNORATE_DEFAULTS = {
  Cairo: 50,
  Giza: 50,
  Alexandria: 65,
  Qaliubiya: 60,
  Sharqia: 70,
  Dakahlia: 70,
  Gharbia: 70,
  Menofia: 70,
  Beheira: 75,
  Damietta: 75,
  "Port Said": 75,
  Ismailia: 75,
  Suez: 75,
  Fayoum: 80,
  "Beni Suef": 80,
  Minya: 85,
  Assiut: 90,
  Sohag: 95,
  Qena: 100,
  Luxor: 110,
  Aswan: 120,
  "Red Sea": 120,
  Matrouh: 120,
  "South Sinai": 130,
  "North Sinai": 130,
  "New Valley": 140,
  "Kafr El Sheikh": 75,
};

const ALL_GOVERNORATES = Object.keys(GOVERNORATE_DEFAULTS);

function Spinner() {
  return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
    </div>
  );
}

export default function ShippingRatesManager() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "available" | "hidden"
  const [editingId, setEditingId] = useState(null);
  const [editingFee, setEditingFee] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [togglingGov, setTogglingGov] = useState(null);

  const load = () => {
    setLoading(true);
    base44.entities.ShippingRate.list("governorate", 100)
      .then((data) => {
        setRates(data || []);
      })
      .catch((err) => {
        console.error("Failed to load shipping rates:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const rateMap = {};
  rates.forEach((r) => {
    rateMap[r.governorate] = r;
  });

  const startEdit = (rate) => {
    setEditingId(rate.id);
    setEditingFee(String(rate.fee));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingFee("");
  };

  const saveRate = async (rate) => {
    const feeNum = Number(editingFee);
    if (isNaN(feeNum) || feeNum < 0) {
      alert("Please enter a valid non-negative fee.");
      return;
    }

    setSavingId(rate.id);
    try {
      const updated = await base44.entities.ShippingRate.update(rate.id, {
        fee: feeNum,
      });

      setRates((prev) =>
        prev.map((r) => (r.id === rate.id ? { ...r, fee: updated.fee } : r))
      );
      setEditingId(null);
      setEditingFee("");
      toast({
        title: "Shipping rate updated",
        description: `${rate.governorate} delivery fee set to ${formatEGP(feeNum)}.`,
      });
    } catch (err) {
      alert("Could not update shipping rate: " + (err.message || "Unknown error"));
    } finally {
      setSavingId(null);
    }
  };

  // Toggle availability (hide / show in checkout)
  const toggleAvailability = async (govName, shouldEnable) => {
    const existingRate = rateMap[govName];
    setTogglingGov(govName);

    try {
      if (shouldEnable) {
        // Enable delivery: create row in shipping_rates
        const defaultFee = GOVERNORATE_DEFAULTS[govName] || 50;
        const created = await base44.entities.ShippingRate.create({
          governorate: govName,
          fee: defaultFee,
        });
        setRates((prev) => [
          ...prev.filter((r) => r.governorate !== govName),
          created,
        ]);
        toast({
          title: "Delivery Enabled",
          description: `Delivery to ${govName} is now available (${formatEGP(defaultFee)}). Shows in checkout.`,
        });
      } else {
        // Disable delivery: delete from shipping_rates so it is hidden from checkout
        if (existingRate?.id) {
          await base44.entities.ShippingRate.delete(existingRate.id);
        }
        setRates((prev) => prev.filter((r) => r.governorate !== govName));
        toast({
          title: "Delivery Disabled",
          description: `Delivery to ${govName} is now unavailable and unshown in checkout.`,
        });
      }
    } catch (err) {
      alert("Error updating availability: " + (err.message || "Unknown error"));
    } finally {
      setTogglingGov(null);
    }
  };

  // Build the list of all governorates with their current status
  const allGovRows = ALL_GOVERNORATES.map((gov) => {
    const rate = rateMap[gov];
    const isAvailable = !!rate && rate.fee !== null && rate.fee >= 0;
    return {
      governorate: gov,
      rate,
      isAvailable,
      fee: isAvailable ? rate.fee : (GOVERNORATE_DEFAULTS[gov] || 50),
    };
  });

  const availableCount = allGovRows.filter((r) => r.isAvailable).length;
  const hiddenCount = allGovRows.filter((r) => !r.isAvailable).length;

  const filteredGovRows = allGovRows.filter((item) => {
    // Filter by status tab
    if (statusFilter === "available" && !item.isAvailable) return false;
    if (statusFilter === "hidden" && item.isAvailable) return false;

    // Filter by search query
    if (!searchQuery.trim()) return true;
    return item.governorate.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-4 border border-border rounded-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search governorates (e.g. Cairo, Sinai)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/50 border border-border rounded-lg text-xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={classNames(
              "px-3 py-1.5 rounded-md font-medium transition-colors",
              statusFilter === "all"
                ? "bg-background text-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All ({allGovRows.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("available")}
            className={classNames(
              "px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1",
              statusFilter === "available"
                ? "bg-background text-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-500" />
            Available ({availableCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("hidden")}
            className={classNames(
              "px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1",
              statusFilter === "hidden"
                ? "bg-background text-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
            Hidden ({hiddenCount})
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={load}
            className="h-9 text-xs font-medium"
            title="Refresh rates"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-3.5 rounded-xl bg-accent/10 border border-accent/20 text-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-accent shrink-0" />
          <span>
            Toggle governorates <strong>OFF</strong> to immediately hide them from the Checkout dropdown when delivery is temporarily unavailable.
          </span>
        </div>
        <span className="font-mono-num font-bold text-accent">
          {availableCount} of 27 Active
        </span>
      </div>

      {/* Rates Table */}
      <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Governorate</TableHead>
              <TableHead>Delivery Status</TableHead>
              <TableHead className="w-48">Delivery Fee (EGP)</TableHead>
              <TableHead className="w-36 text-center">Available in Checkout</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGovRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-12"
                >
                  No governorates match your search or filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredGovRows.map((item, index) => {
                const { governorate, rate, isAvailable } = item;
                const isEditing = rate && editingId === rate.id;
                const isSaving = rate && savingId === rate.id;
                const isToggling = togglingGov === governorate;

                return (
                  <TableRow
                    key={governorate}
                    className={classNames(
                      "border-border transition-colors",
                      !isAvailable && "opacity-60 bg-muted/20"
                    )}
                  >
                    <TableCell className="font-mono-num text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>

                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <Truck
                          className={classNames(
                            "w-4 h-4",
                            isAvailable ? "text-accent" : "text-muted-foreground"
                          )}
                        />
                        <span>{governorate}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {isAvailable ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Eye className="w-3 h-3" /> Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                          <EyeOff className="w-3 h-3" /> Hidden from Checkout
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      {isAvailable ? (
                        isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              step="5"
                              autoFocus
                              value={editingFee}
                              onChange={(e) => setEditingFee(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveRate(rate);
                                if (e.key === "Escape") cancelEdit();
                              }}
                              className="h-8 w-24 font-mono-num font-bold text-sm"
                            />
                            <span className="text-xs text-muted-foreground font-mono-num">
                              EGP
                            </span>
                          </div>
                        ) : (
                          <div
                            onClick={() => startEdit(rate)}
                            className="inline-flex items-center gap-1.5 cursor-pointer group py-1 px-2 -ml-2 rounded hover:bg-muted/60 transition-colors"
                            title="Click to edit fee"
                          >
                            <span className="font-mono-num font-bold text-sm text-foreground">
                              {formatEGP(rate.fee)}
                            </span>
                            <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Unavailable
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isToggling ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : (
                          <Switch
                            checked={isAvailable}
                            onCheckedChange={(val) => toggleAvailability(governorate, val)}
                            title={isAvailable ? "Click to hide from checkout" : "Click to enable delivery"}
                          />
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      {isAvailable ? (
                        isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => saveRate(rate)}
                              disabled={isSaving}
                              className="h-8 px-2.5 text-xs font-semibold gap-1"
                            >
                              {isSaving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              Save
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEdit}
                              disabled={isSaving}
                              className="h-8 px-2 text-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(rate)}
                            className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            Edit Fee
                          </Button>
                        )
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isToggling}
                          onClick={() => toggleAvailability(governorate, true)}
                          className="h-8 px-2.5 text-xs font-medium"
                        >
                          Enable Delivery
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
