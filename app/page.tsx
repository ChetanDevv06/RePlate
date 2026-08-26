import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const effectiveRole = profile?.role || user.user_metadata?.role || 'customer';

  if (effectiveRole === 'business') {
    redirect('/business');
  } else {
    redirect('/customer');
  }
}
