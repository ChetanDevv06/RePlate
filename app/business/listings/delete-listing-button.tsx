'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteListing } from '@/app/actions/listings';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface DeleteListingButtonProps {
  listingId: string;
  listingName: string;
}

export function DeleteListingButton({ listingId, listingName }: DeleteListingButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteListing(listingId);
      if (result.success) {
        toast.success(`"${listingName}" deleted successfully`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to delete listing');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-input bg-background text-destructive hover:bg-destructive/10 hover:border-destructive transition-all text-sm" aria-label={`Delete ${listingName}`}>
            <Trash2 className="size-3.5" />
          </button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Listing</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{listingName}&quot;? This action cannot be undone.
            Any existing reservations will be affected.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? 'Deleting...' : 'Delete Listing'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
