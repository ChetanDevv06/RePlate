import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BusinessProfileView } from './business-profile-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Profile — RePlate Partner Center',
  description: 'Manage your restaurant profile, store location, and surplus revenue performance.',
};

export default async function BusinessProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let [{ data: profile }, { data: business }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('businesses').select('*').eq('owner_id', user.id).maybeSingle(),
  ]);

  if (!profile) redirect('/login');

  // If business profile is missing for this business user, initialize default
  if (!business) {
    const { data: newBusiness } = await supabase
      .from('businesses')
      .insert({
        owner_id: user.id,
        name: 'RUAS Campus Canteen',
        location: 'Bangalore',
        address: 'RUAS Campus, Peenya, Bangalore 560058',
        contact: '+91 98765 43210',
      })
      .select('*')
      .single();

    business = newBusiness;
  }

  if (!business) redirect('/business');

  // Fetch real-time impact performance stats via RPC
  const { data: stats } = await supabase.rpc('get_business_impact_stats', {
    p_business_id: business.id,
  });

  const impactStats = (stats as {
    total_orders: number;
    meals_rescued: number;
    revenue_recovered: number;
    replate_revenue: number;
    estimated_waste_avoided_kg: number;
    active_listings: number;
  }) || {
    total_orders: 0,
    meals_rescued: 0,
    revenue_recovered: 0,
    replate_revenue: 0,
    estimated_waste_avoided_kg: 0,
    active_listings: 0,
  };

  return (
    <BusinessProfileView
      profile={profile}
      business={business}
      impactStats={impactStats}
    />
  );
}
