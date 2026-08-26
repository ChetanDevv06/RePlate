-- ============================================================
-- RePlate — Seed Data
-- Run this AFTER creating demo auth users in Supabase
-- ============================================================
-- 
-- IMPORTANT: Before running this seed, you must create two auth users
-- in the Supabase Dashboard → Authentication → Users:
--
-- 1. customer@replate.demo (password: demo123456)
--    - Set user metadata: {"name": "Demo Customer", "role": "customer"}
--
-- 2. business@replate.demo (password: demo123456)
--    - Set user metadata: {"name": "Demo Business Owner", "role": "business"}
--
-- After creating the users, replace the UUIDs below with the actual UUIDs
-- from Supabase Auth.
-- ============================================================

-- Placeholder UUIDs — REPLACE with actual auth user IDs
-- These will be set by the handle_new_user trigger when you create auth users

-- ============================================================
-- BUSINESSES
-- ============================================================
-- Note: These will be inserted after the business user profile exists.
-- Use the SQL Editor after creating auth users:

/*
-- Replace 'BUSINESS_USER_UUID' with the actual UUID from auth.users

INSERT INTO businesses (id, owner_id, name, location, address, contact, image_url)
VALUES
  (
    uuid_generate_v4(),
    'BUSINESS_USER_UUID',
    'RUAS Campus Canteen',
    'Bangalore',
    'RUAS Campus, Peenya, Bangalore 560058',
    '+91 98765 43210',
    NULL
  ),
  (
    uuid_generate_v4(),
    'BUSINESS_USER_UUID',
    'GreenBite Café',
    'Bangalore',
    '14th Cross, Indiranagar, Bangalore 560038',
    '+91 98765 43211',
    NULL
  ),
  (
    uuid_generate_v4(),
    'BUSINESS_USER_UUID',
    'FreshBake Bakery',
    'Bangalore',
    'Church Street, MG Road, Bangalore 560001',
    '+91 98765 43212',
    NULL
  );

-- ============================================================
-- FOOD LISTINGS (sample — run after businesses exist)
-- ============================================================
-- Replace BUSINESS_IDs with actual business UUIDs

-- RUAS Campus Canteen listings
INSERT INTO food_listings (business_id, name, original_price, discounted_price, quantity, initial_quantity, pickup_start, pickup_deadline, description, status)
VALUES
  (
    'RUAS_CANTEEN_UUID',
    'Veg Sandwich',
    100, 60, 15, 15,
    NOW() + INTERVAL '2 hours',
    NOW() + INTERVAL '5 hours',
    'Fresh vegetable sandwich with mint chutney. Made today, packed with nutrition.',
    'active'
  ),
  (
    'RUAS_CANTEEN_UUID',
    'Rice Bowl',
    150, 90, 20, 20,
    NOW() + INTERVAL '1 hour',
    NOW() + INTERVAL '4 hours',
    'Steamed basmati rice with dal tadka and mixed vegetable curry.',
    'active'
  ),
  (
    'RUAS_CANTEEN_UUID',
    'Idli/Vada Combo',
    80, 50, 25, 25,
    NOW() + INTERVAL '1 hour',
    NOW() + INTERVAL '3 hours',
    '4 soft idlis with 2 crispy vadas, served with coconut chutney and sambar.',
    'active'
  );

-- GreenBite Café listings
INSERT INTO food_listings (business_id, name, original_price, discounted_price, quantity, initial_quantity, pickup_start, pickup_deadline, description, status)
VALUES
  (
    'GREENBITE_UUID',
    'Paneer Wrap',
    120, 72, 10, 10,
    NOW() + INTERVAL '2 hours',
    NOW() + INTERVAL '5 hours',
    'Spiced paneer tikka wrapped in fresh whole wheat roti with tangy sauce.',
    'active'
  );

-- FreshBake Bakery listings
INSERT INTO food_listings (business_id, name, original_price, discounted_price, quantity, initial_quantity, pickup_start, pickup_deadline, description, status)
VALUES
  (
    'FRESHBAKE_UUID',
    'Pastry Box',
    240, 150, 8, 8,
    NOW() + INTERVAL '1 hour',
    NOW() + INTERVAL '4 hours',
    'Assorted box of 4 pastries — chocolate, butterscotch, red velvet, and pineapple.',
    'active'
  );
*/

-- ============================================================
-- SETUP SCRIPT
-- ============================================================
-- After creating auth users and getting their UUIDs, run this helper:
--
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Create customer@replate.demo with metadata: {"name": "Demo Customer", "role": "customer"}
-- 3. Create business@replate.demo with metadata: {"name": "Demo Business Owner", "role": "business"}
-- 4. Copy the business user UUID
-- 5. Run the INSERT statements above with the real UUID
-- ============================================================
