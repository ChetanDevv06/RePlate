import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CustomerProfileView } from './customer-profile-view';
import { ESTIMATED_WEIGHT_PER_MEAL_KG } from '@/lib/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile — RePlate Account Center',
  description: 'Manage your RePlate account, preferences, and food rescue impact.',
};

export default async function CustomerProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  // Fetch customer's completed orders for real-time impact calculations
  const { data: collectedOrders } = await supabase
    .from('orders')
    .select('id, quantity, total_amount')
    .eq('customer_id', user.id)
    .eq('status', 'collected');

  const completedOrders = collectedOrders?.length ?? 0;
  const mealsRescued = collectedOrders?.reduce((sum, o) => sum + (o.quantity || 0), 0) ?? 0;
  const foodValueRecovered = collectedOrders?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) ?? 0;
  const wasteAvoidedKg = Number((mealsRescued * ESTIMATED_WEIGHT_PER_MEAL_KG).toFixed(2));

  return (
    <CustomerProfileView
      profile={profile}
      stats={{
        completedOrders,
        mealsRescued,
        foodValueRecovered,
        wasteAvoidedKg,
      }}
    />
  );
}
