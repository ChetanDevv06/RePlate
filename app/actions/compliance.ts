'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, ComplaintCategory, PolicyType } from '@/types';

/** Generates ticket code RP-2026-XXXXXX */
function generateTicketCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RP-2026-${code}`;
}

export async function submitComplaint(data: {
  category: ComplaintCategory;
  description: string;
  orderId?: string | null;
  businessId?: string | null;
}): Promise<ActionResult<{ ticketNumber: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be signed in to report a concern.' };
  }

  const trimmedDesc = data.description?.trim();
  if (!trimmedDesc || trimmedDesc.length < 10) {
    return { success: false, error: 'Please provide a detailed description (at least 10 characters).' };
  }

  // Food safety concerns receive HIGH priority for immediate attention
  const priority = data.category === 'food_safety' ? 'high' : 'normal';
  const ticketNumber = generateTicketCode();

  // If orderId is provided, lookup associated businessId if missing
  let targetBusinessId = data.businessId || null;
  if (data.orderId && !targetBusinessId) {
    const { data: order } = await supabase
      .from('orders')
      .select('listing:food_listings(business_id)')
      .eq('id', data.orderId)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (order && (order as any).listing?.business_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      targetBusinessId = (order as any).listing.business_id;
    }
  }

  const { error } = await supabase.from('complaints').insert({
    ticket_number: ticketNumber,
    customer_id: user.id,
    business_id: targetBusinessId,
    order_id: data.orderId || null,
    category: data.category,
    description: trimmedDesc,
    priority,
    status: 'open',
  });

  if (error) {
    console.error('Error submitting complaint:', error);
    return { success: false, error: 'Unable to submit your concern. Please try again or email grievance@replate.demo.' };
  }

  return { success: true, data: { ticketNumber } };
}

export async function recordPolicyAcceptance(data: {
  policyType: PolicyType;
  policyVersion: string;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase.from('user_policy_acceptances').insert({
    user_id: user.id,
    policy_type: data.policyType,
    policy_version: data.policyVersion,
  });

  if (error) {
    console.error('Error recording policy acceptance:', error);
  }

  return { success: true };
}

export async function recordBusinessAgreementAcceptance(data: {
  businessId: string;
  agreementVersion: string;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase.from('business_agreement_acceptances').insert({
    business_id: data.businessId,
    user_id: user.id,
    agreement_version: data.agreementVersion,
  });

  if (error) {
    console.error('Error recording business agreement acceptance:', error);
  }

  return { success: true };
}

export async function requestAccountDeletion(data: {
  reason?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  // Log as account_privacy complaint ticket
  const ticketNumber = generateTicketCode();
  await supabase.from('complaints').insert({
    ticket_number: ticketNumber,
    customer_id: user.id,
    category: 'account_privacy',
    description: `Account deletion request submitted. User notes: ${data.reason || 'None provided'}. Note: Transaction and tax audit records are retained per statutory legal obligations.`,
    priority: 'normal',
    status: 'open',
  });

  return {
    success: true,
    data: undefined,
  };
}
