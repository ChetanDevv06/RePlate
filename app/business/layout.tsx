import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BusinessSidebar, BusinessMobileNav } from '@/components/business/business-nav';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Dashboard — RePlate',
};

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'business') redirect('/customer');

  const { data: business } = await supabase
    .from('businesses')
    .select('name')
    .eq('owner_id', user.id)
    .single();

  const businessName = business?.name ?? profile?.name ?? 'Your Business';

  return (
    <div className="min-h-screen bg-background flex">
      <BusinessSidebar businessName={businessName} />
      <div className="flex-1 flex flex-col min-w-0">
        <BusinessMobileNav businessName={businessName} />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
