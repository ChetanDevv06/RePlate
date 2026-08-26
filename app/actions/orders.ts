'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types';

export async function reserveFood(
  listingId: string,
  quantity: number
): Promise<ActionResult<{
  order_id: string;
  order_code: string;
  quantity: number;
  total_amount: number;
  commission: number;
  remaining_quantity: number;
}>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Call the atomic RPC
  const { data, error } = await supabase.rpc('reserve_food', {
    p_listing_id: listingId,
    p_quantity: quantity,
  });

  if (error) {
    console.error('Reserve food error:', error);
    return {
      success: false,
      error: 'We couldn\'t complete that reservation. The item may have just sold out. Please try again.',
    };
  }

  // The RPC returns a JSON object
  const result = data as { success: boolean; error?: string; data?: {
    order_id: string;
    order_code: string;
    quantity: number;
    total_amount: number;
    commission: number;
    remaining_quantity: number;
  }};

  if (!result.success) {
    return { success: false, error: result.error || 'Reservation failed' };
  }

  return { success: true, data: result.data };
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: 'ready' | 'collected' | 'cancelled'
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Call the atomic RPC
  const { data, error } = await supabase.rpc('update_order_status', {
    p_order_id: orderId,
    p_new_status: newStatus,
  });

  if (error) {
    console.error('Update order status error:', error);
    return { success: false, error: 'Failed to update order status' };
  }

  const result = data as { success: boolean; error?: string };

  if (!result.success) {
    return { success: false, error: result.error || 'Status update failed' };
  }

  return { success: true };
}
