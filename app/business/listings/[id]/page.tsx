import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { EditListingClient } from './edit-listing-client';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit Listing — RePlate Business' };

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses').select('id').eq('owner_id', user.id).single();

  if (!business) redirect('/business');

  const { data: listing } = await supabase
    .from('food_listings')
    .select('*')
    .eq('id', id)
    .eq('business_id', business.id)
    .single();

  if (!listing) notFound();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <Link
          href="/business/listings"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to Listings
        </Link>
        <h1 className="text-2xl font-bold">Edit Listing</h1>
        <p className="text-sm text-muted-foreground mt-1">Update your surplus food listing.</p>
      </div>
      <EditListingClient listing={listing} />
    </div>
  );
}
