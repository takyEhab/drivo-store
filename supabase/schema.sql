-- ==============================================================================
-- DRIVO CAR ACCESSORIES — SUPABASE DATABASE SCHEMA & SEED DATA
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  compare_at_price NUMERIC,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  category_slug TEXT,
  availability TEXT DEFAULT 'AVAILABLE' CHECK (availability IN ('AVAILABLE', 'TEMPORARILY_UNAVAILABLE', 'DISCONTINUED')),
  featured BOOLEAN DEFAULT FALSE,
  bestseller BOOLEAN DEFAULT FALSE,
  new_arrival BOOLEAN DEFAULT FALSE,
  images TEXT[] DEFAULT '{}',
  variants JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Egyptian Governorate Shipping Rates Table
CREATE TABLE IF NOT EXISTS shipping_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  governorate TEXT UNIQUE NOT NULL,
  fee NUMERIC NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Promotional Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC NOT NULL,
  min_order NUMERIC DEFAULT 0,
  usage_limit INT,
  used_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL, -- e.g. DRV-839201
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled')),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  governorate TEXT NOT NULL,
  city TEXT NOT NULL,
  detailed_address TEXT NOT NULL,
  building TEXT,
  notes TEXT,
  subtotal NUMERIC NOT NULL,
  shipping_fee NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  coupon_code TEXT,
  items JSONB NOT NULL,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Product Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Product Events Table (Analytics & Live Add-to-Cart Tracking)
CREATE TABLE IF NOT EXISTS product_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  product_id UUID,
  product_name TEXT,
  product_slug TEXT,
  quantity INT DEFAULT 1,
  variant TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Profiles Table (Linked to Supabase Auth Users for Role Management)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to verify admin access
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public Storefront Read Access
DROP POLICY IF EXISTS "Public categories read" ON categories;
CREATE POLICY "Public categories read" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public products read" ON products;
CREATE POLICY "Public products read" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public shipping rates read" ON shipping_rates;
CREATE POLICY "Public shipping rates read" ON shipping_rates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public active coupons read" ON coupons;
CREATE POLICY "Public active coupons read" ON coupons FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Public approved reviews read" ON reviews;
CREATE POLICY "Public approved reviews read" ON reviews FOR SELECT USING (status = 'approved');

-- Customer Order Creation & Order Tracking
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can track their order" ON orders;
CREATE POLICY "Anyone can track their order" ON orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can record product events" ON product_events;
CREATE POLICY "Anyone can record product events" ON product_events FOR INSERT WITH CHECK (true);

-- Customer Profile Read/Update
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- Admin Full Access Policies
DROP POLICY IF EXISTS "Admin full categories" ON categories;
CREATE POLICY "Admin full categories" ON categories FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admin full products" ON products;
CREATE POLICY "Admin full products" ON products FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admin full shipping rates" ON shipping_rates;
CREATE POLICY "Admin full shipping rates" ON shipping_rates FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admin full coupons" ON coupons;
CREATE POLICY "Admin full coupons" ON coupons FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admin full orders" ON orders;
CREATE POLICY "Admin full orders" ON orders FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admin full reviews" ON reviews;
CREATE POLICY "Admin full reviews" ON reviews FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admin read product events" ON product_events;
CREATE POLICY "Admin read product events" ON product_events FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admin manage profiles" ON profiles;
CREATE POLICY "Admin manage profiles" ON profiles FOR ALL USING (is_admin());

-- Automatically create profile entry on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SEED DATA (EGYPT AUTOMOTIVE MARKET)
-- ==============================================================================

-- 1. All 27 Governorates with Standard EGP Delivery Fees
INSERT INTO shipping_rates (governorate, fee) VALUES
('Cairo', 50),
('Giza', 50),
('Alexandria', 65),
('Qaliubiya', 60),
('Sharqia', 70),
('Dakahlia', 70),
('Gharbia', 70),
('Menofia', 70),
('Beheira', 75),
('Damietta', 75),
('Port Said', 75),
('Ismailia', 75),
('Suez', 75),
('Fayoum', 80),
('Beni Suef', 80),
('Minya', 85),
('Assiut', 90),
('Sohag', 95),
('Qena', 100),
('Luxor', 110),
('Aswan', 120),
('Red Sea', 120),
('Matrouh', 120),
('South Sinai', 130),
('North Sinai', 130),
('New Valley', 140)
ON CONFLICT (governorate) DO UPDATE SET fee = EXCLUDED.fee;

-- 2. Categories
INSERT INTO categories (name, slug, image_url, sort_order) VALUES
('Interior Upgrades', 'interior-upgrades', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80', 1),
('Ambient & LED Lighting', 'ambient-led-lighting', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', 2),
('Phone Mounts & Chargers', 'mounts-chargers', 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80', 3),
('Exterior Styling & Protection', 'exterior-styling', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80', 4)
ON CONFLICT (slug) DO NOTHING;

-- 3. Sample Car Accessories Products
INSERT INTO products (name, slug, description, price, compare_at_price, category_slug, availability, featured, bestseller, new_arrival, images, variants, tags)
VALUES
(
  'Carbon Fiber Steering Wheel Cover',
  'carbon-fiber-steering-wheel-cover',
  'Premium anti-slip breathable carbon fiber textured steering wheel cover. Universal 38cm fit for most sedans and SUVs in Egypt.',
  320,
  450,
  'interior-upgrades',
  'AVAILABLE',
  TRUE,
  TRUE,
  FALSE,
  ARRAY['https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80'],
  '[{"name": "Color", "value": "Carbon Black", "price_adjustment": 0}, {"name": "Color", "value": "Sport Red", "price_adjustment": 0}]'::jsonb,
  ARRAY['interior', 'steering', 'carbon']
),
(
  'App-Controlled RGB Symphony Ambient Light Kit',
  'app-controlled-rgb-ambient-light-kit',
  '6-in-1 acrylic fiber optic RGB ambient interior lighting with smartphone Bluetooth app control and music sync mode.',
  850,
  1100,
  'ambient-led-lighting',
  'AVAILABLE',
  TRUE,
  TRUE,
  TRUE,
  ARRAY['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'],
  '[{"name": "Length", "value": "6-in-1 (8 Meters)", "price_adjustment": 0}, {"name": "Length", "value": "10-in-1 (12 Meters)", "price_adjustment": 250}]'::jsonb,
  ARRAY['lighting', 'ambient', 'rgb', 'led']
),
(
  'MagSafe Fast Wireless Car Charger & Vent Mount',
  'magsafe-fast-wireless-car-charger-vent-mount',
  '15W Qi fast wireless charging mount with strong neodymium magnets for iPhone 12/13/14/15/16 and MagSafe cases. 360-degree rotation.',
  480,
  600,
  'mounts-chargers',
  'AVAILABLE',
  TRUE,
  FALSE,
  TRUE,
  ARRAY['https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80'],
  '[]'::jsonb,
  ARRAY['electronics', 'charger', 'magsafe', 'phone mount']
),
(
  'Universal Gloss Black Front Bumper Lip Spoiler',
  'universal-front-bumper-lip-spoiler',
  '3-piece adjustable aerodynamic front chin splitter. High durability ABS plastic with UV protective gloss coat.',
  690,
  900,
  'exterior-styling',
  'AVAILABLE',
  FALSE,
  TRUE,
  FALSE,
  ARRAY['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'],
  '[{"name": "Finish", "value": "Glossy Black", "price_adjustment": 0}, {"name": "Finish", "value": "Carbon Look", "price_adjustment": 100}]'::jsonb,
  ARRAY['exterior', 'body kit', 'spoiler']
)
ON CONFLICT (slug) DO NOTHING;

-- 4. Initial Promo Coupon
INSERT INTO coupons (code, type, value, min_order, usage_limit, active)
VALUES ('DRIVO10', 'percentage', 10, 200, 500, TRUE)
ON CONFLICT (code) DO NOTHING;
