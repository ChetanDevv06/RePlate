import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Phone, Mail, User, LogOut } from 'lucide-react';
import { BusinessProfileForm } from './business-profile-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Profile — RePlate Business' };

export default async function BusinessProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: business }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('businesses').select('*').eq('owner_id', user.id).single(),
  ]);

  if (!profile || !business) redirect('/business');

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Business Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your business information visible to customers.
        </p>
      </div>

      {/* Owner Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="size-4" />
            Account Owner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="size-4 shrink-0" />
            <span>{profile.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="size-4 shrink-0" />
            <span>{profile.name}</span>
          </div>
        </CardContent>
      </Card>

      {/* Business Info Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="size-4" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessProfileForm business={business} />
        </CardContent>
      </Card>
    </div>
  );
}
