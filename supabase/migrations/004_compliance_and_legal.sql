-- ============================================================
-- RePlate — Legal, Compliance, Food Safety & Grievance Schema
-- Migration: 004_compliance_and_legal.sql
-- ============================================================

-- 1. Alter businesses table to include FSSAI details
ALTER TABLE IF EXISTS businesses
  ADD COLUMN IF NOT EXISTS fssai_number TEXT NULL,
  ADD COLUMN IF NOT EXISTS fssai_status TEXT DEFAULT 'not_submitted' CHECK (fssai_status IN ('not_submitted', 'pending', 'verified', 'rejected', 'expired')),
  ADD COLUMN IF NOT EXISTS fssai_verified_at TIMESTAMPTZ NULL;

-- 2. Alter food_listings table to include dietary and allergen details
ALTER TABLE IF EXISTS food_listings
  ADD COLUMN IF NOT EXISTS dietary_type TEXT DEFAULT 'veg' CHECK (dietary_type IN ('veg', 'non_veg', 'vegan', 'egg')),
  ADD COLUMN IF NOT EXISTS allergens TEXT NULL,
  ADD COLUMN IF NOT EXISTS food_handling_notes TEXT NULL;

-- 3. Alter orders table to support future delivery & fulfillment type
ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS fulfillment_type TEXT DEFAULT 'pickup' CHECK (fulfillment_type IN ('pickup', 'delivery'));

-- ============================================================
-- TABLE: food_safety_declarations
-- Auditable log of business confirmations prior to listing publication
-- ============================================================
CREATE TABLE IF NOT EXISTS food_safety_declarations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES food_listings(id) ON DELETE CASCADE,
  accepted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  declaration_version TEXT NOT NULL DEFAULT '1.0',
  declaration_text TEXT NOT NULL,
  accepted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_safety_declarations_listing_id ON food_safety_declarations(listing_id);
CREATE INDEX IF NOT EXISTS idx_food_safety_declarations_business_id ON food_safety_declarations(business_id);

-- ============================================================
-- TABLE: user_policy_acceptances
-- Records user consent for Terms and Privacy policies with versioning
-- ============================================================
CREATE TABLE IF NOT EXISTS user_policy_acceptances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('terms', 'privacy', 'food_safety', 'refunds')),
  policy_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_policy_acceptances_user_id ON user_policy_acceptances(user_id);

-- ============================================================
-- TABLE: business_agreement_acceptances
-- Records business acceptance of the Business Partner Agreement
-- ============================================================
CREATE TABLE IF NOT EXISTS business_agreement_acceptances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agreement_version TEXT NOT NULL DEFAULT '1.0',
  accepted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_agreement_acceptances_business_id ON business_agreement_acceptances(business_id);

-- ============================================================
-- TABLE: complaints
-- Real complaint / grievance ticketing system
-- ============================================================
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID NULL REFERENCES businesses(id) ON DELETE SET NULL,
  order_id UUID NULL REFERENCES orders(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN (
    'food_safety',
    'order_issue',
    'payment_issue',
    'refund_issue',
    'business_complaint',
    'account_privacy',
    'other'
  )),
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open',
    'under_review',
    'awaiting_user',
    'awaiting_business',
    'resolved',
    'closed'
  )),
  resolution_notes TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_complaints_customer_id ON complaints(customer_id);
CREATE INDEX IF NOT EXISTS idx_complaints_business_id ON complaints(business_id);
CREATE INDEX IF NOT EXISTS idx_complaints_order_id ON complaints(order_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);

-- ============================================================
-- TABLE: complaint_messages
-- Threaded communication on complaints
-- ============================================================
CREATE TABLE IF NOT EXISTS complaint_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaint_messages_complaint_id ON complaint_messages(complaint_id);

-- ============================================================
-- TABLE: order_status_history
-- Full audit log of order transitions
-- ============================================================
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by UUID NULL REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB NULL
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE food_safety_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_policy_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_agreement_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- 1. food_safety_declarations RLS
CREATE POLICY "Business owners can view their food safety declarations"
  ON food_safety_declarations FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create food safety declarations for their business"
  ON food_safety_declarations FOR INSERT
  WITH CHECK (
    accepted_by = auth.uid() AND
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- 2. user_policy_acceptances RLS
CREATE POLICY "Users can view their own policy acceptances"
  ON user_policy_acceptances FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can record their own policy acceptances"
  ON user_policy_acceptances FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 3. business_agreement_acceptances RLS
CREATE POLICY "Business owners can view their agreement acceptances"
  ON business_agreement_acceptances FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Business owners can record agreement acceptance"
  ON business_agreement_acceptances FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- 4. complaints RLS
CREATE POLICY "Customers can view their submitted complaints"
  ON complaints FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Businesses can view complaints associated with their store"
  ON complaints FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create complaints"
  ON complaints FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- 5. complaint_messages RLS
CREATE POLICY "Complaint participants can view messages"
  ON complaint_messages FOR SELECT
  USING (
    complaint_id IN (
      SELECT id FROM complaints WHERE customer_id = auth.uid() OR
      business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    )
  );

CREATE POLICY "Complaint participants can add messages"
  ON complaint_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    complaint_id IN (
      SELECT id FROM complaints WHERE customer_id = auth.uid() OR
      business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    )
  );

-- 6. order_status_history RLS
CREATE POLICY "Customers can view history of their orders"
  ON order_status_history FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id = auth.uid()
    )
  );

CREATE POLICY "Businesses can view history of orders for their listings"
  ON order_status_history FOR SELECT
  USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN food_listings fl ON o.listing_id = fl.id
      JOIN businesses b ON fl.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
  );
