'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { loginSchema } from '@/lib/validations';
import type { ActionResult } from '@/types';

export async function signIn(formData: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: 'Invalid email or password. Please try again.' };
  }

  // Get user's role for redirect
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Authentication failed' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const redirectPath = profile?.role === 'business' ? '/business' : '/customer';
  redirect(redirectPath);
}

export async function signInAsDemo(role: 'customer' | 'business'): Promise<ActionResult> {
  const supabase = await createClient();

  const email = role === 'customer' ? 'customer@replate.demo' : 'business@replate.demo';
  const password = 'demo123456';

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: `Demo account not set up. Please create ${email} in Supabase Auth first.`,
    };
  }

  // Get user profile and ensure correct role
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase
      .from('profiles')
      .update({ role, name: role === 'business' ? 'Demo Business Owner' : 'Demo Customer' })
      .eq('id', user.id);

    if (role === 'business') {
      // Ensure business record exists
      const { data: existingBusiness } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (!existingBusiness) {
        await supabase.from('businesses').insert({
          owner_id: user.id,
          name: 'RUAS Campus Canteen',
          location: 'Bangalore',
          address: 'RUAS Campus, Peenya, Bangalore 560058',
          contact: '+91 98765 43210',
        });
      }
    }
  }

  redirect(role === 'business' ? '/business' : '/customer');
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

export async function getCurrentBusiness() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  return business;
}

export async function updateUserProfile(formData: {
  name: string;
  avatar_url?: string | null;
}): Promise<ActionResult<{ name: string; avatar_url: string | null }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const trimmedName = formData.name?.trim();
  if (!trimmedName || trimmedName.length < 2) {
    return { success: false, error: 'Name must be at least 2 characters' };
  }

  const { data: updatedProfile, error } = await supabase
    .from('profiles')
    .update({
      name: trimmedName,
      avatar_url: formData.avatar_url || null,
    })
    .eq('id', user.id)
    .select('name, avatar_url')
    .single();

  if (error) {
    return { success: false, error: 'Failed to update profile. Please try again.' };
  }

  return { success: true, data: updatedProfile };
}

export async function updateUserPassword(formData: {
  password: string;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  if (!formData.password || formData.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  const { error } = await supabase.auth.updateUser({
    password: formData.password,
  });

  if (error) {
    return { success: false, error: error.message || 'Failed to update password' };
  }

  return { success: true };
}

export async function updateBusinessProfile(formData: {
  name: string;
  location: string;
  address?: string;
  contact?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const trimmedName = formData.name?.trim();
  const trimmedLocation = formData.location?.trim();

  if (!trimmedName || trimmedName.length < 2) {
    return { success: false, error: 'Business name must be at least 2 characters' };
  }
  if (!trimmedLocation || trimmedLocation.length < 2) {
    return { success: false, error: 'Location is required' };
  }

  const { error } = await supabase
    .from('businesses')
    .update({
      name: trimmedName,
      location: trimmedLocation,
      address: formData.address?.trim() || null,
      contact: formData.contact?.trim() || null,
    })
    .eq('owner_id', user.id);

  if (error) {
    return { success: false, error: 'Failed to update business details' };
  }

  return { success: true };
}

export async function signUpCustomer(formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  location?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const trimmedName = formData.name?.trim();
  if (!trimmedName || trimmedName.length < 2) {
    return { success: false, error: 'Full name must be at least 2 characters' };
  }
  if (!formData.email || !formData.email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address' };
  }
  if (!formData.password || formData.password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
    options: {
      data: {
        name: trimmedName,
        role: 'customer',
      },
    },
  });

  if (authError) {
    if (authError.message.toLowerCase().includes('already registered') || authError.status === 422) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }
    return { success: false, error: authError.message || 'Unable to create account. Please try again.' };
  }

  if (authData.user) {
    // Upsert customer profile
    await supabase.from('profiles').upsert({
      id: authData.user.id,
      name: trimmedName,
      email: formData.email.trim().toLowerCase(),
      role: 'customer',
    });
  }

  // Automatically sign in to establish session cookies and proceed directly to dashboard
  const { error: autoSignInError } = await supabase.auth.signInWithPassword({
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
  });

  if (autoSignInError) {
    console.warn('Auto sign-in notice after customer registration:', autoSignInError);
  }

  redirect('/customer');
}

export async function signUpBusiness(formData: {
  name: string;
  businessName: string;
  businessType: string;
  email: string;
  password: string;
  confirmPassword?: string;
  location: string;
  address?: string;
  contact?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const trimmedName = formData.name?.trim();
  const trimmedBusinessName = formData.businessName?.trim();
  const trimmedLocation = formData.location?.trim();

  if (!trimmedName || trimmedName.length < 2) {
    return { success: false, error: 'Your name must be at least 2 characters' };
  }
  if (!trimmedBusinessName || trimmedBusinessName.length < 2) {
    return { success: false, error: 'Business name must be at least 2 characters' };
  }
  if (!trimmedLocation || trimmedLocation.length < 2) {
    return { success: false, error: 'City / Area location is required' };
  }
  if (!formData.email || !formData.email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address' };
  }
  if (!formData.password || formData.password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
    options: {
      data: {
        name: trimmedName,
        role: 'business',
      },
    },
  });

  if (authError) {
    if (authError.message.toLowerCase().includes('already registered') || authError.status === 422) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }
    return { success: false, error: authError.message || 'Unable to create business account. Please try again.' };
  }

  if (authData.user) {
    // Upsert business owner profile
    await supabase.from('profiles').upsert({
      id: authData.user.id,
      name: trimmedName,
      email: formData.email.trim().toLowerCase(),
      role: 'business',
    });

    // Create business profile
    await supabase.from('businesses').insert({
      owner_id: authData.user.id,
      name: trimmedBusinessName,
      location: trimmedLocation,
      address: formData.address?.trim() || null,
      contact: formData.contact?.trim() || null,
    });
  }

  // Automatically sign in to establish session cookies and proceed directly to dashboard
  const { error: autoSignInError } = await supabase.auth.signInWithPassword({
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
  });

  if (autoSignInError) {
    console.warn('Auto sign-in notice after business registration:', autoSignInError);
  }

  redirect('/business');
}

export async function sendPasswordResetEmail(email: string): Promise<ActionResult> {
  const supabase = await createClient();

  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());

  if (error) {
    return { success: false, error: 'Unable to send reset email. Please try again.' };
  }

  return { success: true };
}
