import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LoginView } from './login-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In — RePlate Surplus Food Marketplace',
  description: 'Sign in to RePlate or join as a customer or business partner to save good food from waste.',
};

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'business') {
      redirect('/business');
    } else {
      redirect('/customer');
    }
  }

  return <LoginView />;
}
