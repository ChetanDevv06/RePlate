import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CustomerTopNav } from '@/components/customer/customer-nav';
import { SiteFooter } from '@/components/site-footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RePlate — Save Good Food. Waste Less.',
};

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'customer') redirect('/business');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CustomerTopNav userName={profile?.name} />
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6 flex-1 w-full">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
