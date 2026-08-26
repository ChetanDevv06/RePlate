// ============================================================
// RePlate — Shared TypeScript Types
// ============================================================

// --- Enums / Union Types ---

export type UserRole = 'customer' | 'business';

export type ListingStatus = 'active' | 'sold_out' | 'expired' | 'paused';

export type OrderStatus = 'reserved' | 'ready' | 'collected' | 'cancelled';

export type SurplusRisk = 'low' | 'medium' | 'high';

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
  created_at: string;
  ready_at: string | null;
  collected_at: string | null;
  // Joined fields
  listing?: FoodListing;
  customer?: Profile;
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
