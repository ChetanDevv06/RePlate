'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  TrendingUp,
  UtensilsCrossed,
  Leaf,
  DollarSign,
  Package,
  Clock,
  Edit3,
  Lock,
  Bell,
  Sliders,
  ChevronRight,
  HelpCircle,
  Info,
  FileText,
  LogOut,
  ShoppingBag,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency, ESTIMATED_WEIGHT_PER_MEAL_KG } from '@/lib/constants';
import { formatWeight } from '@/lib/calculations';
import { signOut, updateBusinessProfile, updateUserPassword } from '@/app/actions/auth';
import type { Business, Profile } from '@/types';

interface BusinessProfileViewProps {
  profile: Profile;
  business: Business;
  impactStats: {
    total_orders: number;
    meals_rescued: number;
    revenue_recovered: number;
    replate_revenue: number;
    estimated_waste_avoided_kg: number;
    active_listings: number;
  };
}

export function BusinessProfileView({
  profile,
  business: initialBusiness,
  impactStats,
}: BusinessProfileViewProps) {
  const router = useRouter();
  const [business, setBusiness] = useState(initialBusiness);
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [editBusinessOpen, setEditBusinessOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Form states for business update
  const [name, setName] = useState(business.name);
  const [location, setLocation] = useState(business.location);
  const [address, setAddress] = useState(business.address || '');
  const [contact, setContact] = useState(business.contact || '');

  // Form states for password change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notifications
  const [notifications, setNotifications] = useState({
    newOrders: true,
    listingExpiry: true,
    dailySummary: true,
    replateNews: false,
  });

  const businessInitial = business.name?.trim()?.[0]?.toUpperCase() || 'B';

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      toast.error('Business name must be at least 2 characters');
      return;
    }
    if (!location.trim() || location.trim().length < 2) {
      toast.error('Location is required');
      return;
    }

    startTransition(async () => {
      const result = await updateBusinessProfile({
        name,
        location,
        address,
        contact,
      });

      if (result.success) {
        setBusiness((prev) => ({
          ...prev,
          name,
          location,
          address: address || null,
          contact: contact || null,
        }));
        toast.success('Business details updated successfully');
        setEditBusinessOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update business');
      }
    });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    startTransition(async () => {
      const result = await updateUserPassword({ password: newPassword });
      if (result.success) {
        toast.success('Password updated successfully');
        setNewPassword('');
        setConfirmPassword('');
        setSecurityOpen(false);
      } else {
        toast.error(result.error || 'Failed to update password');
      }
    });
  };

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-12">
      {/* 1. Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Business Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Manage your restaurant profile, store location, and surplus revenue performance.
        </p>
      </div>

      {/* 2. Top Grid: Business Card + Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Business Info Card (5 cols) */}
        <Card className="lg:col-span-5 flex flex-col justify-between border-border/70 shadow-sm bg-card overflow-hidden">
          <CardContent className="pt-6 p-6 flex flex-col justify-between h-full space-y-6">
            <div className="space-y-5">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-200 text-primary flex items-center justify-center font-bold text-2xl shadow-inner shrink-0 border border-primary/20">
                  {businessInitial}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground truncate">{business.name}</h2>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize shrink-0">
                      Partner
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{business.location}</p>
                </div>
              </div>

              <Separator />

              {/* Details List */}
              <div className="space-y-3 text-xs md:text-sm">
                <div className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">
                    {business.address || 'Address not specified'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="size-4 text-primary shrink-0" />
                  <span>{business.contact || 'No contact phone set'}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="size-4 text-primary shrink-0" />
                  <span className="truncate">{profile.email} (Owner)</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <ShieldCheck className="size-4 text-primary shrink-0" />
                  <span>FSSAI Status: <strong className="text-foreground">Demo / Pending Verification</strong></span>
                </div>
              </div>
            </div>

            {/* Edit Business Trigger */}
            <Button
              variant="outline"
              className="w-full h-10 text-sm font-medium border-primary/20 hover:border-primary/50 hover:bg-primary/5"
              onClick={() => {
                setName(business.name);
                setLocation(business.location);
                setAddress(business.address || '');
                setContact(business.contact || '');
                setEditBusinessOpen(true);
              }}
            >
              <Edit3 className="size-3.5 mr-2 text-primary" />
              Edit Business Details
            </Button>
          </CardContent>
        </Card>

        {/* Business Performance Impact (7 cols) */}
        <Card className="lg:col-span-7 border-border/70 shadow-sm bg-gradient-to-br from-emerald-50/40 via-card to-green-50/20 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-lg">Surplus Recovery Performance</CardTitle>
                  <CardDescription className="text-xs">
                    Lifetime revenue and sustainability statistics.
                  </CardDescription>
                </div>
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                All Time
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Primary Highlight */}
            <div className="rounded-xl border border-primary/20 bg-white/70 backdrop-blur-sm p-4 text-center">
              <p className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
                {formatCurrency(impactStats.revenue_recovered)}
              </p>
              <p className="text-xs md:text-sm font-medium text-foreground mt-0.5">
                Revenue Recovered
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                From unsold food items sold to local customers before closing.
              </p>
            </div>

            {/* Sub Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border bg-card p-3 text-center">
                <p className="text-base md:text-lg font-bold text-foreground">
                  {impactStats.meals_rescued}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Meals Rescued</p>
              </div>

              <div className="rounded-xl border bg-card p-3 text-center">
                <p className="text-base md:text-lg font-bold text-foreground">
                  {formatWeight(impactStats.estimated_waste_avoided_kg)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Waste Avoided</p>
              </div>

              <div className="rounded-xl border bg-card p-3 text-center">
                <p className="text-base md:text-lg font-bold text-foreground">
                  {impactStats.active_listings}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Active Listings</p>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground text-center">
              * Waste avoided estimated at {ESTIMATED_WEIGHT_PER_MEAL_KG} kg per rescued meal.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Quick Actions & Management */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-1">
          Store Operations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:border-primary/40 hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <UtensilsCrossed className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Food Listings</p>
                  <p className="text-xs text-muted-foreground">Manage active surplus items</p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link href="/business/listings">View</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Package className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Active Orders</p>
                  <p className="text-xs text-muted-foreground">Ready for pickup & collected</p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link href="/business/orders">View</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <BarChart3 className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Analytics</p>
                  <p className="text-xs text-muted-foreground">Detailed trends & reports</p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link href="/business/analytics">View</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. Account Settings (Grouped Rows) */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-1">
          Account & Security
        </h2>

        <div className="rounded-2xl border bg-card divide-y overflow-hidden shadow-sm">
          {/* Edit Business Profile */}
          <button
            type="button"
            onClick={() => setEditBusinessOpen(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-muted/40 transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Business Information</p>
                <p className="text-xs text-muted-foreground">Name, address, contact phone, and store location</p>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Security / Password */}
          <button
            type="button"
            onClick={() => setSecurityOpen(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-muted/40 transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Lock className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Security & Password</p>
                <p className="text-xs text-muted-foreground">Update your partner account password</p>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-muted/40 transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Bell className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Notifications</p>
                <p className="text-xs text-muted-foreground">Order notifications and daily summary emails</p>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* 5. Support & Legal */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-1">
          Partner Support
        </h2>
        <div className="rounded-2xl border bg-card divide-y overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-muted/40 transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0">
                <HelpCircle className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Partner Help & FAQ</p>
                <p className="text-xs text-muted-foreground">Guidelines on pickup verification and 10% commission</p>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-muted/40 transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0">
                <Info className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">About RePlate Partner Network</p>
                <p className="text-xs text-muted-foreground">Platform agreement & terms</p>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* 6. Sign Out Button */}
      <div className="pt-2 flex justify-center">
        <Button
          variant="outline"
          className="w-full max-w-sm h-11 text-sm font-semibold text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 hover:border-destructive transition-all"
          onClick={handleSignOut}
          disabled={isPending}
        >
          <LogOut className="size-4 mr-2" />
          {isPending ? 'Signing out...' : 'Sign Out of Business Account'}
        </Button>
      </div>

      {/* ============================================================ */}
      {/* DIALOGS / MODALS                                             */}
      {/* ============================================================ */}

      {/* Edit Business Profile Dialog */}
      <Dialog open={editBusinessOpen} onOpenChange={setEditBusinessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Business Profile</DialogTitle>
            <DialogDescription>
              Update your store information visible to surplus food customers.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateBusiness} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="biz-name">Business Name *</Label>
              <Input
                id="biz-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. RUAS Campus Canteen"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="biz-location">Location / City *</Label>
              <Input
                id="biz-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="biz-address">Full Address</Label>
              <Input
                id="biz-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Peenya Industrial Area, Bangalore 560058"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="biz-contact">Contact Phone</Label>
              <Input
                id="biz-contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditBusinessOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Security / Password Dialog */}
      <Dialog open={securityOpen} onOpenChange={setSecurityOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Security Settings</DialogTitle>
            <DialogDescription>Update your partner account password.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePassword} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="biz-new-password">New Password</Label>
              <Input
                id="biz-new-password"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="biz-confirm-password">Confirm Password</Label>
              <Input
                id="biz-confirm-password"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSecurityOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Updating...' : 'Update Password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Store Notifications</DialogTitle>
            <DialogDescription>Manage alerts and daily pickup summaries.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {[
              {
                id: 'newOrders',
                title: 'New Reservation Alerts',
                desc: 'Get notified as soon as a customer reserves an item.',
              },
              {
                id: 'listingExpiry',
                title: 'Listing Expiry Reminders',
                desc: 'Reminders 30 minutes before the pickup window closes.',
              },
              {
                id: 'dailySummary',
                title: 'Daily Surplus Summary',
                desc: 'End-of-day report on meals rescued and revenue recovered.',
              },
              {
                id: 'replateNews',
                title: 'RePlate Partner Insights',
                desc: 'Tips and predictions to maximize surplus sales.',
              },
            ].map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 p-2 rounded-lg hover:bg-muted/40">
                <div>
                  <p className="font-semibold text-sm text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[item.id as keyof typeof notifications]}
                  onChange={(e) => {
                    setNotifications((prev) => ({
                      ...prev,
                      [item.id]: e.target.checked,
                    }));
                    toast.success('Store notifications updated');
                  }}
                  className="size-4 mt-1 accent-primary rounded cursor-pointer"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setNotificationsOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Partner Help Dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Partner Help & Guidelines</DialogTitle>
            <DialogDescription>Frequently asked questions for RePlate partners.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs md:text-sm text-muted-foreground">
            <div className="p-3 rounded-lg bg-muted/40 space-y-1">
              <p className="font-semibold text-foreground">How do I verify customer pickups?</p>
              <p>
                When the customer arrives, ask for their 8-digit pickup code (e.g. <code className="font-mono text-primary font-bold">RP-XXXXXX</code>) and click &quot;Mark Collected&quot; on your Orders tab.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 space-y-1">
              <p className="font-semibold text-foreground">How does RePlate pricing & commission work?</p>
              <p>
                RePlate charges a standard 10% platform commission on completed orders. You collect the customer payment at your counter.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setHelpOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* About Partner Network Dialog */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
              <Leaf className="size-6" />
            </div>
            <DialogTitle>RePlate Partner Network</DialogTitle>
            <DialogDescription>Turning food waste into revenue.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs md:text-sm text-muted-foreground">
            <p>
              Thank you for partnering with RePlate to save safe, unsold food and build a zero-waste campus & city environment.
            </p>
            <p className="text-[11px] text-muted-foreground">
              RePlate Partner Portal · Version 1.0.0
            </p>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={() => setAboutOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
