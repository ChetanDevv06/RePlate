import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Leaf } from 'lucide-react';
import { CustomerProfileActions } from './customer-profile-actions';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Profile — RePlate' };

export default async function CustomerProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single();

  if (!profile) redirect('/login');

  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', user.id)
    .eq('status', 'collected');

  return (
    <div className="max-w-md space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Your RePlate account</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {profile.name?.[0]?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div>
              <p className="font-bold text-lg">{profile.name}</p>
              <p className="text-sm text-muted-foreground capitalize">{profile.role} Account</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4 shrink-0" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="size-4 shrink-0" />
              <span>Member since {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Leaf className="size-4 text-primary" />
            My Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 rounded-xl bg-green-50 border border-green-100">
            <p className="text-3xl font-bold text-primary">{orderCount ?? 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Meals rescued</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              ≈ {((orderCount ?? 0) * 0.25).toFixed(2)} kg of waste avoided
            </p>
          </div>
        </CardContent>
      </Card>

      <CustomerProfileActions />
    </div>
  );
}
