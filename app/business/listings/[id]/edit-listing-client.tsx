'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ListingForm } from '@/components/listing-form';
import { updateListing } from '@/app/actions/listings';
import type { FoodListing } from '@/types';
import type { CreateListingFormData } from '@/lib/validations';

interface EditListingClientProps {
  listing: FoodListing;
}

export function EditListingClient({ listing }: EditListingClientProps) {
  const router = useRouter();

  const handleSubmit = async (data: CreateListingFormData & { image_url?: string }) => {
    const result = await updateListing(listing.id, {
      ...data,
      pickup_start: new Date(data.pickup_start).toISOString(),
      pickup_deadline: new Date(data.pickup_deadline).toISOString(),
    });

    if (result.success) {
      toast.success('Listing updated successfully');
      router.push('/business/listings');
      router.refresh();
    } else {
      toast.error(result.error ?? 'Failed to update listing');
    }
  };

  return (
    <ListingForm
      mode="edit"
      initialData={{
        ...listing,
        description: listing.description ?? undefined,
        image_url: listing.image_url ?? undefined,
      }}
      onSubmit={handleSubmit}
    />
  );
}
