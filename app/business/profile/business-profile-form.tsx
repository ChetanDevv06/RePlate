'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateBusinessSchema, type UpdateBusinessFormData } from '@/lib/validations';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Business } from '@/types';
import { signOut } from '@/app/actions/auth';
import { LogOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function BusinessProfileForm({ business }: { business: Business }) {
  const [isPending, startTransition] = useTransition();
  const [signOutPending, startSignOut] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateBusinessFormData>({
    resolver: zodResolver(updateBusinessSchema),
    defaultValues: {
      name: business.name,
      location: business.location,
      address: business.address ?? '',
      contact: business.contact ?? '',
    },
  });

  const onSubmit = (data: UpdateBusinessFormData) => {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from('businesses')
        .update({
          name: data.name,
          location: data.location,
          address: data.address || null,
          contact: data.contact || null,
        })
        .eq('id', business.id);

      if (error) {
        toast.error('Failed to update business profile');
      } else {
        toast.success('Business profile updated');
        router.refresh();
      }
    });
  };

  const handleSignOut = () => {
    startSignOut(async () => {
      await signOut();
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="business-name">Business Name *</Label>
          <Input id="business-name" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location / City *</Label>
          <Input id="location" placeholder="e.g. Bangalore" {...register('location')} />
          {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Full Address</Label>
          <Input id="address" placeholder="e.g. 14th Cross, Indiranagar" {...register('address')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact">Contact Number</Label>
          <Input id="contact" placeholder="+91 98765 43210" {...register('contact')} />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>

      <Separator />

      <div>
        <p className="text-sm font-medium mb-2">Account</p>
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
          onClick={handleSignOut}
          disabled={signOutPending}
        >
          <LogOut className="size-4 mr-2" />
          {signOutPending ? 'Signing out...' : 'Sign Out'}
        </Button>
      </div>
    </div>
  );
}
