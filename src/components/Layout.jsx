import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { base44 } from "@/api/base44Client";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import WhatsAppButton from "@/components/storefront/WhatsAppButton";

export default function Layout() {
  const [categories, setCategories] = useState([]);
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    let active = true;
    base44.entities.Category.list("sort_order", 50)
      .then((res) => {
        if (active) setCategories(res);
      })
      .catch(() => { });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar categories={categories} />
      <main className="flex-1">
        <Outlet context={{ categories }} />
      </main>
      <Footer categories={categories} />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
