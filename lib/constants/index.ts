// ============================================================
// RePlate — Central Constants
// ============================================================

/** RePlate takes 10% commission on each order */
export const COMMISSION_RATE = 0.10;

/** Estimated weight per meal/food item for waste calculation (kg) */
export const ESTIMATED_WEIGHT_PER_MEAL_KG = 0.25;

/** Surplus risk thresholds */
export const SURPLUS_RISK_HIGH_THRESHOLD = 0.50;
export const SURPLUS_RISK_MEDIUM_THRESHOLD = 0.25;

/** Recommended discounts by risk level */
export const RECOMMENDED_DISCOUNTS: Record<string, number> = {
  high: 0.40,
  medium: 0.30,
  low: 0.20,
};

/** Recommended listing times by risk level */
export const RECOMMENDED_LISTING_TIMES: Record<string, string> = {
  high: '2–3 hours before closing',
  medium: '2 hours before closing',
  low: '1–2 hours before closing',
};

/** Order status display labels */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  reserved: 'Reserved',
  ready: 'Ready for Pickup',
  collected: 'Collected',
  cancelled: 'Cancelled',
};

/** Listing status display labels */
export const LISTING_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  sold_out: 'Sold Out',
  expired: 'Expired',
  paused: 'Paused',
};

/** Valid order state transitions */
export const VALID_ORDER_TRANSITIONS: Record<string, string[]> = {
  reserved: ['ready', 'cancelled'],
  ready: ['collected'],
  collected: [],
  cancelled: [],
};

/** Currency formatter for Indian Rupees */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/** Demo account credentials (for login page display only) */
export const DEMO_ACCOUNTS = {
  customer: {
    email: 'customer@replate.demo',
    password: 'demo123456',
    label: 'Customer Demo',
  },
  business: {
    email: 'business@replate.demo',
    password: 'demo123456',
    label: 'Business Demo',
  },
};

/** Max file size for image uploads (5 MB) */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/** Allowed image types */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
