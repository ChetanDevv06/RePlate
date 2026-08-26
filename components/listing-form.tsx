'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Upload, X, ImageIcon, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { PredictionCard } from '@/components/prediction-card';
import { createListingSchema, type CreateListingFormData } from '@/lib/validations';
import { createListing, uploadFoodImage } from '@/app/actions/listings';
import { calculateDiscountPercentage, calculatePotentialRevenue, calculateCommission } from '@/lib/calculations';
import { formatCurrency } from '@/lib/constants';
import { format, addHours } from 'date-fns';

function toDatetimeLocal(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

interface ListingFormProps {
  initialData?: Partial<CreateListingFormData & { id: string; image_url: string }>;
  mode?: 'create' | 'edit';
  onSubmit?: (data: CreateListingFormData & { image_url?: string }) => Promise<void>;
}

export function ListingForm({ initialData, mode = 'create', onSubmit: onSubmitProp }: ListingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url ?? null);
  const [uploading, setUploading] = useState(false);

  const now = new Date();
  const defaultPickupStart = toDatetimeLocal(addHours(now, 2));
  const defaultPickupEnd = toDatetimeLocal(addHours(now, 5));

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      original_price: initialData?.original_price !== undefined ? Number(initialData.original_price) : undefined,
      discounted_price: initialData?.discounted_price !== undefined ? Number(initialData.discounted_price) : undefined,
      quantity: initialData?.quantity !== undefined ? Number(initialData.quantity) : undefined,
      pickup_start: initialData?.pickup_start
        ? toDatetimeLocal(new Date(initialData.pickup_start))
        : defaultPickupStart,
      pickup_deadline: initialData?.pickup_deadline
        ? toDatetimeLocal(new Date(initialData.pickup_deadline))
        : defaultPickupEnd,
      description: initialData?.description ?? '',
    },
  });

  const watchedOriginalPrice = watch('original_price');
  const watchedDiscountedPrice = watch('discounted_price');
  const watchedQuantity = watch('quantity');
  const watchedName = watch('name');
  const watchedPickupStart = watch('pickup_start');
  const watchedPickupEnd = watch('pickup_deadline');

  const discount = calculateDiscountPercentage(watchedOriginalPrice ?? 0, watchedDiscountedPrice ?? 0);
  const potentialRevenue = calculatePotentialRevenue(watchedDiscountedPrice ?? 0, watchedQuantity ?? 0);
  const commission = calculateCommission(potentialRevenue);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleApplyRecommendation = (discountedPrice: number) => {
    setValue('discounted_price', discountedPrice);
    toast.success(`Applied recommended price: ${formatCurrency(discountedPrice)}`);
  };

  const onSubmit = async (data: CreateListingFormData) => {
    startTransition(async () => {
      try {
        let image_url: string | undefined;

        // Upload image if selected
        if (imageFile) {
          setUploading(true);
          const uploadResult = await uploadFoodImage(imageFile);
          setUploading(false);
          if (!uploadResult.success) {
            toast.error(uploadResult.error ?? 'Image upload failed');
            return;
          }
          image_url = uploadResult.data;
        }

        if (onSubmitProp) {
          await onSubmitProp({ ...data, image_url });
          return;
        }

        const result = await createListing({
          ...data,
          image_url: image_url ?? imagePreview ?? null,
          pickup_start: new Date(data.pickup_start).toISOString(),
          pickup_deadline: new Date(data.pickup_deadline).toISOString(),
        });

        if (result.success) {
          toast.success('Listing created! Customers can now discover your surplus food.');
          router.push('/business/listings');
          router.refresh();
        } else {
          toast.error(result.error ?? 'Failed to create listing');
        }
      } catch {
        toast.error('An unexpected error occurred');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Food Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Food Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Paneer Wrap, Rice Bowl"
                  {...register('name')}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What's in the dish? Any special notes for customers..."
                  rows={3}
                  {...register('description')}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Food Image</CardTitle>
            </CardHeader>
            <CardContent>
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden h-48">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setImageFile(null); }}
                    className="absolute top-2 right-2 size-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                  <ImageIcon className="size-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium text-muted-foreground">Click to upload image</span>
                  <span className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP · Max 5 MB</span>
                </label>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
              {!imagePreview && (
                <p className="text-xs text-muted-foreground mt-2">
                  Adding a photo increases reservations significantly.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="original_price">Original Price (₹) *</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="100"
                    {...register('original_price', { valueAsNumber: true })}
                  />
                  {errors.original_price && <p className="text-xs text-destructive">{errors.original_price.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discounted_price">Discounted Price (₹) *</Label>
                  <Input
                    id="discounted_price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="60"
                    {...register('discounted_price', { valueAsNumber: true })}
                  />
                  {errors.discounted_price && <p className="text-xs text-destructive">{errors.discounted_price.message}</p>}
                </div>
              </div>

              {watchedOriginalPrice > 0 && watchedDiscountedPrice > 0 && watchedDiscountedPrice < watchedOriginalPrice && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-100 text-sm">
                  <span className="text-green-700 font-semibold">{discount}% OFF</span>
                  <span className="text-muted-foreground">—</span>
                  <span className="text-muted-foreground">
                    Customer saves {formatCurrency(watchedOriginalPrice - watchedDiscountedPrice)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quantity & Pickup */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Availability & Pickup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Available Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="20"
                  {...register('quantity', { valueAsNumber: true })}
                />
                {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickup_start">Pickup Start *</Label>
                  <Input
                    id="pickup_start"
                    type="datetime-local"
                    {...register('pickup_start')}
                  />
                  {errors.pickup_start && <p className="text-xs text-destructive">{errors.pickup_start.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickup_deadline">Pickup Deadline *</Label>
                  <Input
                    id="pickup_deadline"
                    type="datetime-local"
                    {...register('pickup_deadline')}
                  />
                  {errors.pickup_deadline && <p className="text-xs text-destructive">{errors.pickup_deadline.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Preview & Prediction */}
        <div className="space-y-6">
          {/* Live Preview */}
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden bg-card">
                <div className="h-32 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center relative">
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🍱</span>
                  )}
                  {discount > 0 && (
                    <div className="absolute top-2 left-2 discount-badge">
                      {discount}% OFF
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1.5">
                  <p className="font-semibold text-sm">{watchedName || 'Your food name'}</p>
                  <div className="flex items-center gap-2">
                    {watchedDiscountedPrice > 0 && (
                      <span className="text-primary font-bold text-sm">{formatCurrency(watchedDiscountedPrice)}</span>
                    )}
                    {watchedOriginalPrice > 0 && (
                      <span className="text-muted-foreground line-through text-xs">{formatCurrency(watchedOriginalPrice)}</span>
                    )}
                  </div>
                  {watchedQuantity > 0 && (
                    <p className="text-xs text-muted-foreground">{watchedQuantity} available</p>
                  )}
                  {watchedPickupStart && watchedPickupEnd && (
                    <p className="text-xs text-muted-foreground">
                      Pickup {format(new Date(watchedPickupStart), 'h:mm a')} – {format(new Date(watchedPickupEnd), 'h:mm a')}
                    </p>
                  )}
                </div>
              </div>

              {/* Revenue preview */}
              {potentialRevenue > 0 && (
                <div className="mt-4 space-y-2 text-xs">
                  <Separator />
                  <div className="flex justify-between text-muted-foreground pt-2">
                    <span>Potential revenue</span>
                    <span className="font-semibold text-foreground">{formatCurrency(potentialRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>RePlate commission (10%)</span>
                    <span className="text-foreground">–{formatCurrency(commission)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Your earnings</span>
                    <span className="text-primary">{formatCurrency(potentialRevenue - commission)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Smart Prediction */}
          <PredictionCard
            originalPrice={watchedOriginalPrice}
            onApplyRecommendation={handleApplyRecommendation}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || uploading}
          className="min-w-32"
        >
          {isPending || uploading ? (
            <span className="flex items-center gap-2">
              <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {uploading ? 'Uploading...' : 'Publishing...'}
            </span>
          ) : (
            mode === 'create' ? 'Publish Listing' : 'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}
