-- ============================================================
-- RePlate — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles
-- Linked to Supabase Auth users
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'business')),
  avatar_url TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: businesses
-- Each business belongs to a business-role user
-- ============================================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT NULL,
  contact TEXT NULL,
  image_url TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: food_listings
-- Surplus food items published by businesses
-- ============================================================
CREATE TABLE IF NOT EXISTS food_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT NULL,
  original_price NUMERIC(10,2) NOT NULL CHECK (original_price > 0),
  discounted_price NUMERIC(10,2) NOT NULL CHECK (discounted_price > 0),
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  initial_quantity INTEGER NOT NULL CHECK (initial_quantity > 0),
  pickup_start TIMESTAMPTZ NOT NULL,
  pickup_deadline TIMESTAMPTZ NOT NULL,
  description TEXT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold_out', 'expired', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure discounted price is less than original price
  CONSTRAINT valid_discount CHECK (discounted_price < original_price),
  -- Ensure pickup deadline is after pickup start
  CONSTRAINT valid_pickup_window CHECK (pickup_deadline > pickup_start)
);

-- ============================================================
-- TABLE: orders
-- Customer reservations for food listings
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_code TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES food_listings(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount > 0),
  commission NUMERIC(10,2) NOT NULL CHECK (commission >= 0),
  status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'ready', 'collected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ready_at TIMESTAMPTZ NULL,
  collected_at TIMESTAMPTZ NULL
);

-- ============================================================
-- INDEXES for query performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_food_listings_business_id ON food_listings(business_id);
CREATE INDEX IF NOT EXISTS idx_food_listings_status ON food_listings(status);
CREATE INDEX IF NOT EXISTS idx_food_listings_pickup_deadline ON food_listings(pickup_deadline);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);

-- ============================================================
-- TRIGGER: auto-update updated_at on food_listings
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_food_listings_updated_at
  BEFORE UPDATE ON food_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TRIGGER: auto-create profile on auth.users insert
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
