-- ============================================================
-- RePlate — Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES policies
-- ============================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow reading profiles for order context (customer name on business orders)
CREATE POLICY "Authenticated users can read basic profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- BUSINESSES policies
-- ============================================================

-- Anyone authenticated can read business info (for listing context)
CREATE POLICY "Authenticated users can read businesses"
  ON businesses FOR SELECT
  USING (auth.role() = 'authenticated');

-- Business owners can create their own business
CREATE POLICY "Business owners can create business"
  ON businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Business owners can update their own business
CREATE POLICY "Business owners can update own business"
  ON businesses FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- ============================================================
-- FOOD_LISTINGS policies
-- ============================================================

-- Anyone authenticated can read active listings
CREATE POLICY "Authenticated users can read active listings"
  ON food_listings FOR SELECT
  USING (auth.role() = 'authenticated');

-- Business owners can create listings for their own business
CREATE POLICY "Business owners can create listings"
  ON food_listings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = food_listings.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Business owners can update their own listings
CREATE POLICY "Business owners can update own listings"
  ON food_listings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = food_listings.business_id
      AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = food_listings.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Business owners can delete their own listings
CREATE POLICY "Business owners can delete own listings"
  ON food_listings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = food_listings.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- ============================================================
-- ORDERS policies
-- ============================================================

-- Customers can read their own orders
CREATE POLICY "Customers can read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = customer_id);

-- Business owners can read orders for their listings
CREATE POLICY "Business owners can read orders for own listings"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM food_listings
      JOIN businesses ON businesses.id = food_listings.business_id
      WHERE food_listings.id = orders.listing_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Customers can create orders (customer role check done in RPC)
CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Business owners can update order status for their listings
CREATE POLICY "Business owners can update order status"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM food_listings
      JOIN businesses ON businesses.id = food_listings.business_id
      WHERE food_listings.id = orders.listing_id
      AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM food_listings
      JOIN businesses ON businesses.id = food_listings.business_id
      WHERE food_listings.id = orders.listing_id
      AND businesses.owner_id = auth.uid()
    )
  );
