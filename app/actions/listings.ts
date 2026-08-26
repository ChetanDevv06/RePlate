'use server';

import { createClient } from '@/lib/supabase/server';
import { createListingSchema } from '@/lib/validations';
import type { ActionResult, FoodListing } from '@/types';

export async function createListing(formData: {
  name: string;
  image_url?: string | null;
  original_price: number;
  discounted_price: number;
  quantity: number;
  pickup_start: string;
  pickup_deadline: string;
  description?: string;
}): Promise<ActionResult<FoodListing>> {
  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Verify business role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'business') {
    return { success: false, error: 'Only business accounts can create listings' };
  }

  // Get the user's business
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!business) {
    return { success: false, error: 'No business found for your account' };
  }

  // Validate input
  const parsed = createListingSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Create listing
  const { data: listing, error } = await supabase
    .from('food_listings')
    .insert({
      business_id: business.id,
      name: parsed.data.name,
      image_url: formData.image_url || null,
      original_price: parsed.data.original_price,
      discounted_price: parsed.data.discounted_price,
      quantity: parsed.data.quantity,
      initial_quantity: parsed.data.quantity,
      pickup_start: parsed.data.pickup_start,
      pickup_deadline: parsed.data.pickup_deadline,
      description: parsed.data.description || null,
      dietary_type: parsed.data.dietary_type || 'veg',
      allergens: parsed.data.allergens?.trim() || null,
      food_handling_notes: parsed.data.food_handling_notes?.trim() || null,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('Create listing error:', error);
    return { success: false, error: 'Failed to create listing. Please check your inputs.' };
  }

  // Record audit log for Food Safety Declaration
  try {
    await supabase.from('food_safety_declarations').insert({
      business_id: business.id,
      listing_id: listing.id,
      accepted_by: user.id,
      declaration_version: '1.0',
      declaration_text:
        'I confirm that this food has been prepared, handled, stored and packaged in accordance with applicable food-safety requirements and FSSAI standards, is wholesome and fit for consumption, and is being offered within its safe-consumption period.',
    });
  } catch (auditErr) {
    console.warn('Food safety declaration audit log error:', auditErr);
  }

  return { success: true, data: listing };
}

export async function updateListing(
  listingId: string,
  formData: {
    name?: string;
    image_url?: string | null;
    original_price?: number;
    discounted_price?: number;
    quantity?: number;
    pickup_start?: string;
    pickup_deadline?: string;
    description?: string;
    dietary_type?: string;
    allergens?: string;
    food_handling_notes?: string;
    status?: string;
  }
): Promise<ActionResult<FoodListing>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Verify ownership via business
  const { data: listing } = await supabase
    .from('food_listings')
    .select('*, business:businesses!inner(*)')
    .eq('id', listingId)
    .single();

  if (!listing) {
    return { success: false, error: 'Listing not found' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((listing as any).business?.owner_id !== user.id) {
    return { success: false, error: 'You do not own this listing' };
  }

  const updateData: Record<string, unknown> = {};
  if (formData.name !== undefined) updateData.name = formData.name;
  if (formData.image_url !== undefined) updateData.image_url = formData.image_url;
  if (formData.original_price !== undefined) updateData.original_price = formData.original_price;
  if (formData.discounted_price !== undefined) updateData.discounted_price = formData.discounted_price;
  if (formData.quantity !== undefined) {
    updateData.quantity = formData.quantity;
    updateData.initial_quantity = formData.quantity;
  }
  if (formData.pickup_start !== undefined) updateData.pickup_start = formData.pickup_start;
  if (formData.pickup_deadline !== undefined) updateData.pickup_deadline = formData.pickup_deadline;
  if (formData.description !== undefined) updateData.description = formData.description;
  if (formData.dietary_type !== undefined) updateData.dietary_type = formData.dietary_type;
  if (formData.allergens !== undefined) updateData.allergens = formData.allergens;
  if (formData.food_handling_notes !== undefined) updateData.food_handling_notes = formData.food_handling_notes;
  if (formData.status !== undefined) updateData.status = formData.status;

  const { data: updated, error } = await supabase
    .from('food_listings')
    .update(updateData)
    .eq('id', listingId)
    .select()
    .single();

  if (error) {
    console.error('Update listing error:', error);
    return { success: false, error: 'Failed to update listing' };
  }

  return { success: true, data: updated };
}

export async function deleteListing(listingId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Verify ownership
  const { data: listing } = await supabase
    .from('food_listings')
    .select('*, business:businesses!inner(*)')
    .eq('id', listingId)
    .single();

  if (!listing) {
    return { success: false, error: 'Listing not found' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((listing as any).business?.owner_id !== user.id) {
    return { success: false, error: 'You do not own this listing' };
  }

  const { error } = await supabase
    .from('food_listings')
    .delete()
    .eq('id', listingId);

  if (error) {
    console.error('Delete listing error:', error);
    return { success: false, error: 'Failed to delete listing' };
  }

  return { success: true };
}

export async function uploadFoodImage(file: File): Promise<ActionResult<string>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Validate file
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'Image must be under 5 MB' };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from('food-images')
    .upload(fileName, file);

  if (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Failed to upload image' };
  }

  const { data: { publicUrl } } = supabase.storage
    .from('food-images')
    .getPublicUrl(fileName);

  return { success: true, data: publicUrl };
}
