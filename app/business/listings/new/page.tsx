import type { Metadata } from 'next';
import { ListingForm } from '@/components/listing-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = { title: 'New Listing — RePlate Business' };

export default function NewListingPage() {
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
        <h1 className="text-2xl font-bold">Create New Listing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          List your surplus food and recover revenue before it goes to waste.
        </p>
      </div>
      <ListingForm mode="create" />
    </div>
  );
}
