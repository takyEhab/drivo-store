# Drivo Store — Style Your Ride 🚗💨

Modern e-commerce platform for car accessories in Egypt (operating in EGP, governorate-based shipping rates, Cash on Delivery, order tracking, and admin management). Built with **React 18**, **Vite**, **Tailwind CSS**, and backed by **Supabase**.

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- A free [Supabase](https://supabase.com) account & project

### 2. Environment Variables
Copy `.env.example` to `.env.local` and add your Supabase credentials:
```bash
cp .env.example .env.local
```

Fill in your project keys from Supabase Dashboard (**Project Settings** -> **API**):
```ini
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 3. Database & Seed Data Setup
1. In your Supabase dashboard, open the **SQL Editor**.
2. Open [`supabase/schema.sql`](file:///e:/MyProjects/drivo_base44/supabase/schema.sql).
3. Copy and paste the entire script into the SQL editor and click **Run**.
   - This creates all 8 tables (`categories`, `products`, `shipping_rates`, `coupons`, `orders`, `reviews`, `product_events`, `profiles`).
   - Configures Row Level Security (RLS) policies.
   - Populates initial Egyptian governorate delivery fees, car accessories categories, sample products, and promo coupon (`DRIVO10`).

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
drivo-store/
├── supabase/
│   └── schema.sql           # Complete PostgreSQL schema, RLS, and Egypt seed data
├── src/
│   ├── api/
│   │   ├── entities.js      # Supabase data adapter (CRUD for products, orders, etc.)
│   │   └── base44Client.js  # Backwards-compatible export adapter
│   ├── components/
│   │   ├── admin/           # MetricsCards, OrdersManager, InventoryManager, ProductEditDialog
│   │   ├── storefront/      # Navbar, Hero, ProductCard, CartDrawer, Footer, WhatsAppButton
│   │   └── ui/              # Radix UI and Tailwind component library
│   ├── lib/
│   │   ├── AuthContext.jsx  # Supabase authentication provider with session listener
│   │   ├── cart-context.jsx # Shopping cart state with persistent localStorage
│   │   ├── format.js        # EGP currency formatter
│   │   └── supabase.js      # Supabase client initialization
│   ├── pages/
│   │   ├── Home.jsx         # Hero, categories, featured car upgrades
│   │   ├── Products.jsx     # Catalog with search, category filtering & sorting
│   │   ├── ProductDetail.jsx# Product images, variants, reviews, and add-to-cart
│   │   ├── Checkout.jsx     # Governorate delivery fees, coupon engine, COD checkout
│   │   ├── TrackOrder.jsx   # Live order tracking by order number and phone
│   │   └── Admin.jsx        # Admin dashboard with orders & inventory controls
│   ├── App.jsx              # Application router
│   └── main.jsx             # Entry point
├── scripts/
│   └── rename-folder.bat    # 1-click workspace folder rename helper
├── .env.example             # Supabase environment variables template
├── package.json             # Project metadata & scripts
└── vite.config.js           # Standard Vite configuration with React & path aliases
```

---

## 🛡️ Admin Access Setup

To promote a user account to **Admin**:
1. Sign up a user through the website (`/register`) or in Supabase Auth (**Authentication** -> **Users**).
2. In Supabase **Table Editor**, open the `profiles` table.
3. Change the user's `role` column from `'customer'` to `'admin'`.
4. Now log in at `/login` and navigate to `/admin` to access the full admin dashboard!
