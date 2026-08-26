// ============================================================
// RePlate — Calculation Utilities
// ============================================================

import { COMMISSION_RATE, ESTIMATED_WEIGHT_PER_MEAL_KG } from '@/lib/constants';

/**
 * Calculate discount percentage between original and discounted price.
 * Example: original=100, discounted=60 → 40
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  discountedPrice: number
): number {
  if (originalPrice <= 0) return 0;
  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return Math.round(discount);
}

/**
 * Calculate potential revenue from a listing.
 * potential = discountedPrice × quantity
 */
export function calculatePotentialRevenue(
  discountedPrice: number,
  quantity: number
): number {
  return discountedPrice * quantity;
}

/**
 * Calculate RePlate commission on a given amount.
 * commission = amount × COMMISSION_RATE (10%)
 */
export function calculateCommission(amount: number): number {
  return Math.round(amount * COMMISSION_RATE * 100) / 100;
}

/**
 * Calculate order total for a given item price and quantity.
 */
export function calculateOrderTotal(
  discountedPrice: number,
  quantity: number
): number {
  return discountedPrice * quantity;
}

/**
 * Calculate estimated waste avoided in kilograms.
 * waste_kg = meals × ESTIMATED_WEIGHT_PER_MEAL_KG
 */
export function calculateWasteAvoided(mealsCollected: number): number {
  return mealsCollected * ESTIMATED_WEIGHT_PER_MEAL_KG;
}

/**
 * Calculate net business revenue (after RePlate commission).
 */
export function calculateNetBusinessRevenue(totalAmount: number): number {
  return totalAmount - calculateCommission(totalAmount);
}

/**
 * Format a weight in kg for display.
 */
export function formatWeight(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} tonnes`;
  }
  return `${kg.toFixed(2)} kg`;
}
