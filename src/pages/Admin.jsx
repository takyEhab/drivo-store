import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Lock,
  ArrowLeft,
  LogOut,
  Truck,
} from "lucide-react";
import Logo from "@/components/storefront/Logo";
import MetricsCards from "@/components/admin/MetricsCards";
import OrdersManager from "@/components/admin/OrdersManager";
import InventoryManager from "@/components/admin/InventoryManager";
import ShippingRatesManager from "@/components/admin/ShippingRatesManager";

export default function Admin() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("overview");

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <Lock className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
        <h1 className="font-heading text-2xl font-bold tracking-tighter">
          Access Restricted
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          This area is for store administrators only.
        </p>
        <Link
          to="/"
          className="inline-block mt-6 text-accent font-medium text-sm"
        >
          ← Back to store
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Logo />
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />{" "}
              <span className="hidden sm:inline">View store</span>
            </Link>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors px-2 py-1"
            >
              <LogOut className="w-4 h-4" />{" "}
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex items-center gap-3 mb-2">
          <span className="block h-[2px] w-8 bg-accent" />
          <p className="font-mono-num text-xs tracking-[0.25em] uppercase text-muted-foreground">
            Admin
          </p>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tighter mb-8">
          Dashboard
        </h1>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-card">
            <TabsTrigger value="overview" className="px-4">
              <LayoutDashboard className="w-4 h-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="px-4">
              <ClipboardList className="w-4 h-4 mr-2" /> Orders
            </TabsTrigger>
            <TabsTrigger value="inventory" className="px-4">
              <Package className="w-4 h-4 mr-2" /> Inventory
            </TabsTrigger>
            <TabsTrigger value="shipping" className="px-4">
              <Truck className="w-4 h-4 mr-2" /> Shipping Rates
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <MetricsCards />
          </TabsContent>
          <TabsContent value="orders" className="mt-6">
            <OrdersManager />
          </TabsContent>
          <TabsContent value="inventory" className="mt-6">
            <InventoryManager />
          </TabsContent>
          <TabsContent value="shipping" className="mt-6">
            <ShippingRatesManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
