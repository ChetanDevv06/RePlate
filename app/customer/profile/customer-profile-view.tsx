'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Calendar,
  Leaf,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  Bell,
  Sliders,
  ChevronRight,
  HelpCircle,
  Info,
  FileText,
  LogOut,
  Edit3,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
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
import { signOut, updateUserProfile, updateUserPassword } from '@/app/actions/auth';
import type { Profile } from '@/types';

interface CustomerProfileViewProps {
  profile: Profile;
  stats: {
    completedOrders: number;
    mealsRescued: number;
    foodValueRecovered: number;
    wasteAvoidedKg: number;
  };
}

export function CustomerProfileView({ profile: initialProfile, stats }: CustomerProfileViewProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  // Form states
  const [editName, setEditName] = useState(profile.name);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification toggles
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    pickupReminders: true,
    surplusAlerts: true,
    replateUpdates: false,
  });

  // Preference toggles
  const [preferences, setPreferences] = useState({
    preferredCity: 'Bangalore',
    vegOnly: false,
    maxDistanceKm: '5',
  });

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const userInitial = profile.name?.trim()?.[0]?.toUpperCase() || 'U';

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || editName.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    startTransition(async () => {
      const result = await updateUserProfile({ name: editName });
      if (result.success && result.data) {
        setProfile((prev) => ({ ...prev, name: result.data!.name }));
        toast.success('Profile updated successfully');
        setEditProfileOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update profile');
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
        toast.success('Password changed successfully');
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

  const hasImpact = stats.mealsRescued > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-12">
      {/* 1. Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Manage your RePlate account, preferences, and impact.
        </p>
      </div>

      {/* 2. Top Grid: Profile Card + Impact Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Profile Card (5 cols) */}
        <Card className="lg:col-span-5 flex flex-col justify-between border-border/70 shadow-sm overflow-hidden bg-card">
          <CardContent className="pt-6 p-6 flex flex-col justify-between h-full space-y-6">
            <div className="space-y-5">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-200 text-primary flex items-center justify-center font-bold text-2xl shadow-inner shrink-0 border border-primary/20">
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground truncate">{profile.name}</h2>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize shrink-0">
                      {profile.role}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{profile.email}</p>
                </div>
              </div>

              <Separator />

              {/* Details List */}
              <div className="space-y-2.5 text-xs md:text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="size-4 text-primary shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="size-4 text-primary shrink-0" />
                  <span>Member since {memberSince}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <ShieldCheck className="size-4 text-primary shrink-0" />
                  <span>Verified RePlate Member</span>
                </div>
              </div>
            </div>

            {/* Edit Profile Trigger */}
            <Button
              variant="outline"
              className="w-full h-10 text-sm font-medium border-primary/20 hover:border-primary/50 hover:bg-primary/5"
              onClick={() => {
                setEditName(profile.name);
                setEditProfileOpen(true);
              }}
            >
              <Edit3 className="size-3.5 mr-2 text-primary" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Impact Section (7 cols) */}
        <Card className="lg:col-span-7 border-border/70 shadow-sm bg-gradient-to-br from-emerald-50/40 via-card to-green-50/20 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Leaf className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-lg">Your RePlate Impact</CardTitle>
                  <CardDescription className="text-xs">
                    Every rescued meal is one less meal wasted.
                  </CardDescription>
                </div>
              </div>
              {hasImpact && (
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="size-3" /> Rescuer
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {hasImpact ? (
              <>
                {/* Main Hero Impact Metric */}
                <div className="rounded-xl border border-primary/20 bg-white/70 backdrop-blur-sm p-4 text-center">
                  <p className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
                    {stats.mealsRescued}
                  </p>
                  <p className="text-xs md:text-sm font-medium text-foreground mt-0.5">
                    meals rescued so far
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Every rescued meal helps reduce avoidable greenhouse gases & food waste.
                  </p>
                </div>

                {/* Sub Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border bg-card p-3 text-center">
                    <p className="text-base md:text-lg font-bold text-foreground">
                      {formatCurrency(stats.foodValueRecovered)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Food Value</p>
                  </div>

                  <div className="rounded-xl border bg-card p-3 text-center">
                    <p className="text-base md:text-lg font-bold text-foreground">
                      {formatWeight(stats.wasteAvoidedKg)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Waste Avoided</p>
                  </div>

                  <div className="rounded-xl border bg-card p-3 text-center">
                    <p className="text-base md:text-lg font-bold text-foreground">
                      {stats.completedOrders}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Orders Done</p>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground text-center">
                  * Estimated waste avoided calculated at {ESTIMATED_WEIGHT_PER_MEAL_KG} kg/meal.
                </p>
              </>
            ) : (
              <div className="py-6 px-4 rounded-xl border border-dashed text-center space-y-3 bg-white/50">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  <Leaf className="size-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">No rescued meals yet</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Your first RePlate reservation could be the start of your sustainability impact!
                  </p>
                </div>
                <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-xs">
                  <Link href="/customer/explore">
                    Explore surplus food
                    <ArrowRight className="size-3 ml-1.5" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. Account Settings (Grouped Rows) */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-1">
          Account Settings
        </h2>

        <div className="rounded-2xl border bg-card divide-y overflow-hidden shadow-sm">
          {/* Personal Information */}
          <button
            type="button"
            onClick={() => {
              setEditName(profile.name);
              setEditProfileOpen(true);
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-muted/40 transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <User className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Personal Information</p>
                <p className="text-xs text-muted-foreground">Name, email, and account credentials</p>
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
                <p className="text-xs text-muted-foreground">Manage order alerts and pickup reminders</p>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Security */}
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
                <p className="font-semibold text-sm text-foreground">Security</p>
                <p className="text-xs text-muted-foreground">Password update and login security</p>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Preferences */}
          <button
            type="button"
            onClick={() => setPreferencesOpen(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-muted/40 transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Sliders className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Preferences</p>
                <p className="text-xs text-muted-foreground">Location, dietary, and search preferences</p>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* 4. Your Activity Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-1">
          Your Activity
        </h2>
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="grid grid-cols-3 gap-6 sm:gap-10">
                <div>
                  <p className="text-2xl font-extrabold text-foreground">{stats.completedOrders}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Orders completed</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-primary">{stats.mealsRescued}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Meals rescued</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-foreground">
                    {formatCurrency(stats.foodValueRecovered)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Total recovered</p>
                </div>
              </div>

              <Button asChild variant="outline" className="w-full sm:w-auto shrink-0 text-sm">
                <Link href="/customer/orders">
                  <ShoppingBag className="size-4 mr-2" />
                  View My Orders
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 5. Help, Support & About */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-1">
          Support & Legal
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
                <p className="font-semibold text-sm text-foreground">Help & Support</p>
                <p className="text-xs text-muted-foreground">FAQ, how reservations work, and customer support</p>
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
                <p className="font-semibold text-sm text-foreground">About RePlate</p>
                <p className="text-xs text-muted-foreground">Our mission, team, and version v1.0.0</p>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-muted/40 transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0">
                <FileText className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Privacy & Terms</p>
                <p className="text-xs text-muted-foreground">Data policies and food safety commitment</p>
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
          {isPending ? 'Signing out...' : 'Sign Out'}
        </Button>
      </div>

      {/* ============================================================ */}
      {/* DIALOGS / MODALS                                             */}
      {/* ============================================================ */}

      {/* Edit Profile Modal */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your personal information visible on RePlate.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input id="edit-email" value={profile.email} disabled className="bg-muted opacity-70" />
              <p className="text-[11px] text-muted-foreground">
                Email is managed through your authentication credentials.
              </p>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditProfileOpen(false)}
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

      {/* Notifications Modal */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notification Preferences</DialogTitle>
            <DialogDescription>Choose which alerts and reminders you receive.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {[
              {
                id: 'orderUpdates',
                title: 'Order Updates',
                desc: 'Real-time status changes when your reservation is ready for pickup.',
              },
              {
                id: 'pickupReminders',
                title: 'Pickup Reminders',
                desc: 'Alerts before the pickup window closes.',
              },
              {
                id: 'surplusAlerts',
                title: 'New Surplus Food Nearby',
                desc: 'Notifications when local bakeries or canteens list new items.',
              },
              {
                id: 'replateUpdates',
                title: 'RePlate Sustainability News',
                desc: 'Monthly summary of food rescued in your community.',
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
                    toast.success('Preferences updated');
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

      {/* Security Modal */}
      <Dialog open={securityOpen} onOpenChange={setSecurityOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Security Settings</DialogTitle>
            <DialogDescription>Update your account password.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePassword} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
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

      {/* Preferences Modal */}
      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>RePlate Preferences</DialogTitle>
            <DialogDescription>Customize your food discovery preferences.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="pref-city">Preferred City / Campus</Label>
              <Input
                id="pref-city"
                value={preferences.preferredCity}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, preferredCity: e.target.value }))
                }
                placeholder="e.g. Bangalore, RUAS Peenya"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pref-radius">Search Radius (km)</Label>
              <Input
                id="pref-radius"
                type="number"
                value={preferences.maxDistanceKm}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, maxDistanceKm: e.target.value }))
                }
                placeholder="5"
              />
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40">
              <div>
                <p className="font-semibold text-sm">Vegetarian Only Filter</p>
                <p className="text-xs text-muted-foreground">Prioritize vegetarian meals by default</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.vegOnly}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, vegOnly: e.target.checked }))
                }
                className="size-4 accent-primary rounded cursor-pointer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                toast.success('Preferences saved');
                setPreferencesOpen(false);
              }}
            >
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help & Support Modal */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Help & Support</DialogTitle>
            <DialogDescription>Frequently asked questions & assistance.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs md:text-sm text-muted-foreground">
            <div className="p-3 rounded-lg bg-muted/40 space-y-1">
              <p className="font-semibold text-foreground">How do reservations work?</p>
              <p>
                Find surplus food from local cafeterias or bakeries, reserve it with one click, and show your unique pickup code at the counter.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 space-y-1">
              <p className="font-semibold text-foreground">When do I pay?</p>
              <p>
                No online payment is required. You pay the discounted price directly at the store during collection.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 space-y-1">
              <p className="font-semibold text-foreground">Need urgent help?</p>
              <p>
                Reach out to our community support desk at <strong className="text-foreground">support@replate.demo</strong>.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setHelpOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* About Modal */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
              <Leaf className="size-6" />
            </div>
            <DialogTitle>About RePlate</DialogTitle>
            <DialogDescription>Good food deserves another plate.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs md:text-sm text-muted-foreground">
            <p>
              RePlate is an impact-driven surplus food marketplace connecting local restaurants, bakeries, and campus canteens with conscious consumers to eliminate food waste.
            </p>
            <div className="p-3 rounded-xl bg-green-50 text-primary font-medium text-xs">
              🌱 Built for sustainability, affordability, and zero waste.
            </div>
            <p className="text-[11px] text-muted-foreground">
              RePlate Web Platform · Version 1.0.0
            </p>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={() => setAboutOpen(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terms & Privacy Modal */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Privacy & Terms of Service</DialogTitle>
            <DialogDescription>Our safety and privacy commitments.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs md:text-sm text-muted-foreground max-h-60 overflow-y-auto pr-1">
            <p className="font-semibold text-foreground">1. Food Safety</p>
            <p>
              All participating businesses certify that surplus listings represent safe, edible food prepared under sanitary conditions and sold within safe consumption windows.
            </p>
            <p className="font-semibold text-foreground">2. Privacy Commitment</p>
            <p>
              We only store your account profile, order reservations, and pickup verification codes. Your data is never sold or shared with 3rd-party advertisers.
            </p>
            <p className="font-semibold text-foreground">3. Fair Pickup Policy</p>
            <p>
              Please collect reservations before the pickup deadline so businesses can close on schedule.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setTermsOpen(false)}>I Understand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
