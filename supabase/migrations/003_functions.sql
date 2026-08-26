-- ============================================================
-- RePlate — Database Functions & RPCs
-- Migration: 003_functions.sql
-- ============================================================

-- ============================================================
-- FUNCTION: generate_order_code
-- Generates a unique RP-XXXXXX order code
-- ============================================================
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT;
  i INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    code := 'RP-';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check uniqueness
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_code = code) INTO code_exists;
    IF NOT code_exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: reserve_food
-- Atomically creates an order and decrements listing quantity.
-- Prevents race conditions and negative inventory.
-- ============================================================
CREATE OR REPLACE FUNCTION reserve_food(
  p_listing_id UUID,
  p_quantity INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_listing RECORD;
  v_order_code TEXT;
  v_total_amount NUMERIC(10,2);
  v_commission NUMERIC(10,2);
  v_order_id UUID;
  v_new_quantity INTEGER;
BEGIN
  -- Get the current authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Verify user is a customer
  SELECT role INTO v_user_role FROM profiles WHERE id = v_user_id;
  IF v_user_role != 'customer' THEN
    RETURN json_build_object('success', false, 'error', 'Only customers can reserve food');
  END IF;
  
  -- Validate quantity
  IF p_quantity <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Quantity must be positive');
  END IF;
  
  -- Lock the listing row to prevent race conditions
  SELECT * INTO v_listing
  FROM food_listings
  WHERE id = p_listing_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Listing not found');
  END IF;
  
  -- Verify listing is active
  IF v_listing.status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'This listing is no longer available');
  END IF;
  
  -- Verify pickup deadline hasn't passed
  IF v_listing.pickup_deadline < NOW() THEN
    RETURN json_build_object('success', false, 'error', 'The pickup window has expired');
  END IF;
  
  -- Verify sufficient quantity
  IF p_quantity > v_listing.quantity THEN
    RETURN json_build_object('success', false, 'error', 
      'Not enough items available. Only ' || v_listing.quantity || ' remaining.');
  END IF;
  
  -- Calculate totals
  v_total_amount := v_listing.discounted_price * p_quantity;
  v_commission := ROUND(v_total_amount * 0.10, 2);
  
  -- Generate unique order code
  v_order_code := generate_order_code();
  
  -- Atomically decrement quantity
  v_new_quantity := v_listing.quantity - p_quantity;
  
  UPDATE food_listings
  SET quantity = v_new_quantity,
      status = CASE WHEN v_new_quantity = 0 THEN 'sold_out' ELSE status END
  WHERE id = p_listing_id;
  
  -- Create the order
  INSERT INTO orders (order_code, customer_id, listing_id, quantity, total_amount, commission, status)
  VALUES (v_order_code, v_user_id, p_listing_id, p_quantity, v_total_amount, v_commission, 'reserved')
  RETURNING id INTO v_order_id;
  
  RETURN json_build_object(
    'success', true,
    'data', json_build_object(
      'order_id', v_order_id,
      'order_code', v_order_code,
      'quantity', p_quantity,
      'total_amount', v_total_amount,
      'commission', v_commission,
      'remaining_quantity', v_new_quantity
    )
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'An unexpected error occurred. Please try again.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: update_order_status
-- Validates state transitions and updates timestamps.
-- ============================================================
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id UUID,
  p_new_status TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_order RECORD;
  v_is_business_owner BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Fetch the order
  SELECT o.*, fl.business_id
  INTO v_order
  FROM orders o
  JOIN food_listings fl ON fl.id = o.listing_id
  WHERE o.id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Order not found');
  END IF;
  
  -- Verify the user is the business owner of this listing
  SELECT EXISTS(
    SELECT 1 FROM businesses
    WHERE id = v_order.business_id
    AND owner_id = v_user_id
  ) INTO v_is_business_owner;
  
  IF NOT v_is_business_owner THEN
    RETURN json_build_object('success', false, 'error', 'You do not have permission to update this order');
  END IF;
  
  -- Validate state transition
  IF v_order.status = 'reserved' AND p_new_status = 'ready' THEN
    UPDATE orders SET status = 'ready', ready_at = NOW() WHERE id = p_order_id;
  ELSIF v_order.status = 'ready' AND p_new_status = 'collected' THEN
    UPDATE orders SET status = 'collected', collected_at = NOW() WHERE id = p_order_id;
  ELSIF v_order.status = 'reserved' AND p_new_status = 'cancelled' THEN
    -- On cancellation, restore the listing quantity
    UPDATE food_listings
    SET quantity = quantity + v_order.quantity,
        status = CASE WHEN status = 'sold_out' THEN 'active' ELSE status END
    WHERE id = v_order.listing_id;
    
    UPDATE orders SET status = 'cancelled' WHERE id = p_order_id;
  ELSE
    RETURN json_build_object('success', false, 'error', 
      'Invalid status transition from ' || v_order.status || ' to ' || p_new_status);
  END IF;
  
  RETURN json_build_object('success', true);
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'An unexpected error occurred');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: get_business_impact_stats
-- Calculates dynamic impact statistics for a business
-- ============================================================
CREATE OR REPLACE FUNCTION get_business_impact_stats(p_business_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats RECORD;
  v_active_listings INTEGER;
BEGIN
  -- Aggregate from collected orders
  SELECT
    COALESCE(COUNT(*), 0) as total_orders,
    COALESCE(SUM(o.quantity), 0) as meals_rescued,
    COALESCE(SUM(o.total_amount), 0) as revenue_recovered,
    COALESCE(SUM(o.commission), 0) as replate_revenue
  INTO v_stats
  FROM orders o
  JOIN food_listings fl ON fl.id = o.listing_id
  WHERE fl.business_id = p_business_id
  AND o.status = 'collected';
  
  -- Count active listings
  SELECT COUNT(*) INTO v_active_listings
  FROM food_listings
  WHERE business_id = p_business_id
  AND status = 'active'
  AND quantity > 0
  AND pickup_deadline > NOW();
  
  RETURN json_build_object(
    'total_orders', v_stats.total_orders,
    'meals_rescued', v_stats.meals_rescued,
    'revenue_recovered', v_stats.revenue_recovered,
    'replate_revenue', v_stats.replate_revenue,
    'estimated_waste_avoided_kg', v_stats.meals_rescued * 0.25,
    'active_listings', v_active_listings
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Storage bucket for food images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('food-images', 'food-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to food-images bucket
CREATE POLICY "Authenticated users can upload food images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'food-images'
    AND auth.role() = 'authenticated'
  );

-- Allow public read access to food images
CREATE POLICY "Public read access for food images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'food-images');

-- Allow users to update their own uploads
CREATE POLICY "Users can update own food images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'food-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own food images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'food-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
