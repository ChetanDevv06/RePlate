// ============================================================
// RePlate — Smart Prediction Engine (Rule-Based MVP)
// ============================================================
//
// This is a transparent rule-based heuristic, NOT machine learning.
// It is designed so an ML model can replace it later.

import type { PredictionInput, PredictionResult, SurplusRisk } from '@/types';
import {
  SURPLUS_RISK_HIGH_THRESHOLD,
  SURPLUS_RISK_MEDIUM_THRESHOLD,
  RECOMMENDED_DISCOUNTS,
  RECOMMENDED_LISTING_TIMES,
} from '@/lib/constants';

/**
 * Calculate surplus risk based on stock vs expected demand.
 *
 * Algorithm:
 * 1. surplus = currentStock - expectedDemand
 * 2. If surplus <= 0 → LOW RISK
 * 3. surplusRatio = surplus / currentStock
 * 4. surplusRatio >= 0.50 → HIGH RISK
 * 5. surplusRatio >= 0.25 → MEDIUM RISK
 * 6. Otherwise → LOW RISK
 */
export function calculateSurplusRisk(input: PredictionInput): PredictionResult {
  const { current_stock, expected_demand } = input;

  // Guard against division by zero
  if (current_stock <= 0) {
    return {
      risk: 'low',
      surplus_quantity: 0,
      surplus_ratio: 0,
      recommended_discount: RECOMMENDED_DISCOUNTS.low,
      recommended_listing_time: RECOMMENDED_LISTING_TIMES.low,
      explanation: 'No current stock to analyze.',
    };
  }

  const surplus = current_stock - expected_demand;

  if (surplus <= 0) {
    return {
      risk: 'low',
      surplus_quantity: 0,
      surplus_ratio: 0,
      recommended_discount: RECOMMENDED_DISCOUNTS.low,
      recommended_listing_time: RECOMMENDED_LISTING_TIMES.low,
      explanation: 'Expected demand meets or exceeds current stock. Low surplus risk.',
    };
  }

  const surplusRatio = surplus / current_stock;
  let risk: SurplusRisk;
  let explanation: string;

  if (surplusRatio >= SURPLUS_RISK_HIGH_THRESHOLD) {
    risk = 'high';
    explanation = `${Math.round(surplusRatio * 100)}% of stock may go unsold. Consider a significant discount to move inventory quickly.`;
  } else if (surplusRatio >= SURPLUS_RISK_MEDIUM_THRESHOLD) {
    risk = 'medium';
    explanation = `${Math.round(surplusRatio * 100)}% of stock may go unsold. A moderate discount could help reduce waste.`;
  } else {
    risk = 'low';
    explanation = `Only ${Math.round(surplusRatio * 100)}% of stock may go unsold. A small discount should suffice.`;
  }

  return {
    risk,
    surplus_quantity: surplus,
    surplus_ratio: surplusRatio,
    recommended_discount: RECOMMENDED_DISCOUNTS[risk],
    recommended_listing_time: RECOMMENDED_LISTING_TIMES[risk],
    explanation,
  };
}

/**
 * Apply recommended discount to an original price.
 * Returns the new discounted price.
 */
export function applyRecommendedDiscount(
  originalPrice: number,
  discountPercentage: number
): number {
  return Math.round(originalPrice * (1 - discountPercentage));
}

/**
 * Get risk level color for UI display.
 */
export function getRiskColor(risk: SurplusRisk): string {
  switch (risk) {
    case 'high':
      return 'text-red-600';
    case 'medium':
      return 'text-amber-600';
    case 'low':
      return 'text-green-600';
  }
}

/**
 * Get risk level icon indicator.
 */
export function getRiskIndicator(risk: SurplusRisk): string {
  switch (risk) {
    case 'high':
      return '🔴';
    case 'medium':
      return '🟡';
    case 'low':
      return '🟢';
  }
}
