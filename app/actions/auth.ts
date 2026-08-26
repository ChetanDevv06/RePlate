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

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.trim().toLowerCase(),
    password: parsed.data.password,
  });

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return {
        success: false,
        error: 'Please confirm your email address before signing in, or disable "Confirm email" in your Supabase Auth dashboard (Authentication -> Providers -> Email).',
      };
    }
    return { success: false, error: error.message || 'Invalid email or password. Please try again.' };
  }

  const user = authData.user;
  if (!user) {
    return { success: false, error: 'Authentication failed' };
  }

  // Get user profile
  let { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', user.id)
    .maybeSingle();

  // Self-heal: If profile record is missing from table, create it from auth metadata
  if (!profile) {
    const userRole = (user.user_metadata?.role as 'customer' | 'business') || 'customer';
    const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';

    await supabase.from('profiles').upsert({
      id: user.id,
      name: userName,
      email: user.email || '',
      role: userRole,
    });

    if (userRole === 'business') {
      const { data: existingBiz } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (!existingBiz) {
        await supabase.from('businesses').insert({
          owner_id: user.id,
          name: user.user_metadata?.business_name || userName || 'My Business',
          location: user.user_metadata?.location || 'Bangalore',
        });
      }
    }

    profile = { role: userRole, name: userName };
  }

  const redirectPath = profile.role === 'business' ? '/business' : '/customer';
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

  const cleanEmail = formData.email.trim().toLowerCase();

  // 1. Sign up user in Supabase Auth with metadata
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: cleanEmail,
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

  // 2. Sign in to establish active authenticated session context (sets auth.uid() for RLS)
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: formData.password,
  });

  if (signInError) {
    if (signInError.message.toLowerCase().includes('email not confirmed')) {
      return {
        success: false,
        error: 'Account created! Please check your email to confirm your account before signing in, or disable "Confirm email" in Supabase Auth settings.',
      };
    }
    return { success: false, error: signInError.message || 'Failed to authenticate after registration.' };
  }

  const activeUserId = signInData.user?.id || authData.user?.id;

  // 3. Insert/Upsert customer profile with authenticated permissions
  if (activeUserId) {
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: activeUserId,
      name: trimmedName,
      email: cleanEmail,
      role: 'customer',
    });

    if (profileErr) {
      console.error('Error creating customer profile:', profileErr);
    }
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

  const cleanEmail = formData.email.trim().toLowerCase();

  // 1. Sign up user in Supabase Auth with metadata
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: cleanEmail,
    password: formData.password,
    options: {
      data: {
        name: trimmedName,
        role: 'business',
        business_name: trimmedBusinessName,
        business_type: formData.businessType,
        location: trimmedLocation,
      },
    },
  });

  if (authError) {
    if (authError.message.toLowerCase().includes('already registered') || authError.status === 422) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }
    return { success: false, error: authError.message || 'Unable to create business account. Please try again.' };
  }

  // 2. Sign in to establish active authenticated session context (sets auth.uid() for RLS)
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: formData.password,
  });

  if (signInError) {
    if (signInError.message.toLowerCase().includes('email not confirmed')) {
      return {
        success: false,
        error: 'Account created! Please check your email to confirm your account before signing in, or disable "Confirm email" in Supabase Auth settings.',
      };
    }
    return { success: false, error: signInError.message || 'Failed to authenticate after business registration.' };
  }

  const activeUserId = signInData.user?.id || authData.user?.id;

  // 3. Insert/Upsert business profile & store record with authenticated permissions
  if (activeUserId) {
    // Upsert business owner profile
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: activeUserId,
      name: trimmedName,
      email: cleanEmail,
      role: 'business',
    });

    if (profileErr) {
      console.error('Error creating business owner profile:', profileErr);
    }

    // Check and create business store record
    const { data: existingBiz } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', activeUserId)
      .maybeSingle();

    if (!existingBiz) {
      const { error: bizErr } = await supabase.from('businesses').insert({
        owner_id: activeUserId,
        name: trimmedBusinessName,
        location: trimmedLocation,
        address: formData.address?.trim() || null,
        contact: formData.contact?.trim() || null,
      });

      if (bizErr) {
        console.error('Error inserting business store record:', bizErr);
      }
    }
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
