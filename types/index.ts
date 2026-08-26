// ============================================================
// RePlate — Shared TypeScript Types
// ============================================================

// --- Enums / Union Types ---

export type UserRole = 'customer' | 'business';

export type ListingStatus = 'active' | 'sold_out' | 'expired' | 'paused';

export type OrderStatus = 'reserved' | 'ready' | 'collected' | 'cancelled';

export type SurplusRisk = 'low' | 'medium' | 'high';

export type FssaiStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected' | 'expired';

export type DietaryType = 'veg' | 'non_veg' | 'vegan' | 'egg';

export type FulfillmentType = 'pickup' | 'delivery';

export type ComplaintCategory =
  | 'food_safety'
  | 'order_issue'
  | 'payment_issue'
  | 'refund_issue'
  | 'business_complaint'
  | 'account_privacy'
  | 'other';

export type ComplaintStatus =
  | 'open'
  | 'under_review'
  | 'awaiting_user'
  | 'awaiting_business'
  | 'resolved'
  | 'closed';

export type ComplaintPriority = 'normal' | 'high' | 'urgent';

export type PolicyType = 'terms' | 'privacy' | 'food_safety' | 'refunds';

// --- Database Row Types ---

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  location: string;
  address: string | null;
  contact: string | null;
  image_url: string | null;
  fssai_number?: string | null;
  fssai_status?: FssaiStatus;
  fssai_verified_at?: string | null;
  created_at: string;
}

export interface FoodListing {
  id: string;
  business_id: string;
  name: string;
  image_url: string | null;
  original_price: number;
  discounted_price: number;
  quantity: number;
  initial_quantity: number;
  pickup_start: string;
  pickup_deadline: string;
  description: string | null;
  status: ListingStatus;
  dietary_type?: DietaryType;
  allergens?: string | null;
  food_handling_notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields (optional — present when querying with joins)
  business?: Business;
}

export interface Order {
  id: string;
  order_code: string;
  customer_id: string;
  listing_id: string;
  quantity: number;
  total_amount: number;
  commission: number;
  status: OrderStatus;
  fulfillment_type?: FulfillmentType;
  created_at: string;
  ready_at: string | null;
  collected_at: string | null;
  // Joined fields
  listing?: FoodListing;
  customer?: Profile;
}

export interface FoodSafetyDeclaration {
  id: string;
  business_id: string;
  listing_id: string;
  accepted_by: string;
  declaration_version: string;
  declaration_text: string;
  accepted_at: string;
}

export interface UserPolicyAcceptance {
  id: string;
  user_id: string;
  policy_type: PolicyType;
  policy_version: string;
  accepted_at: string;
}

export interface BusinessAgreementAcceptance {
  id: string;
  business_id: string;
  user_id: string;
  agreement_version: string;
  accepted_at: string;
}

export interface Complaint {
  id: string;
  ticket_number: string;
  customer_id: string;
  business_id?: string | null;
  order_id?: string | null;
  category: ComplaintCategory;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  resolution_notes?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  changed_by?: string | null;
  created_at: string;
  metadata?: Record<string, unknown> | null;
}

// --- Computed / Display Types ---

export interface ImpactStats {
  total_orders: number;
  meals_rescued: number;
  revenue_recovered: number;
  replate_revenue: number;
  estimated_waste_avoided_kg: number;
  active_listings: number;
}

export interface PredictionInput {
  average_daily_sales: number;
  current_stock: number;
  expected_demand: number;
}

export interface PredictionResult {
  risk: SurplusRisk;
  surplus_quantity: number;
  surplus_ratio: number;
  recommended_discount: number;
  recommended_listing_time: string;
  explanation: string;
}

// --- Form Types ---

export interface CreateListingInput {
  name: string;
  image_url?: string | null;
  original_price: number;
  discounted_price: number;
  quantity: number;
  pickup_start: string;
  pickup_deadline: string;
  description?: string;
  dietary_type?: DietaryType;
  allergens?: string;
  food_handling_notes?: string;
}

export interface UpdateListingInput extends Partial<CreateListingInput> {
  id: string;
  status?: ListingStatus;
}

export interface ReserveInput {
  listing_id: string;
  quantity: number;
}

// --- API Response Types ---

export interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}
