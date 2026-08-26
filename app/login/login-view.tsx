'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Mail,
  Lock,
  Leaf,
  ArrowRight,
  Users,
  Building2,
  Eye,
  EyeOff,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Store,
  MapPin,
  Phone,
  Tag,
  Clock,
  HelpCircle,
  FileText,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
  signIn,
  signInAsDemo,
  signUpCustomer,
  signUpBusiness,
  sendPasswordResetEmail,
} from '@/app/actions/auth';
import { z } from 'zod';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginFormData = z.infer<typeof loginSchema>;

const customerSignUpSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
  location: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type CustomerSignUpFormData = z.infer<typeof customerSignUpSchema>;

const businessSignUpSchema = z.object({
  name: z.string().trim().min(2, 'Your name must be at least 2 characters'),
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters'),
  businessType: z.enum(['Restaurant', 'Café', 'Bakery', 'College Canteen', 'Other']),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
  location: z.string().trim().min(2, 'City / Area is required'),
  address: z.string().optional(),
  contact: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type BusinessSignUpFormData = z.infer<typeof businessSignUpSchema>;

export function LoginView() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<'customer' | 'business'>('customer');
  const [isPending, startTransition] = useTransition();
  const [demoLoading, setDemoLoading] = useState<'customer' | 'business' | null>(null);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password dialog
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPending, setForgotPending] = useState(false);

  // Info Dialogs (Privacy, Terms, Help)
  const [helpOpen, setHelpOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  // 1. Sign In Form Hook
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // 2. Customer Sign Up Form Hook
  const {
    register: registerCustomer,
    handleSubmit: handleCustomerSubmit,
    formState: { errors: customerErrors },
  } = useForm<CustomerSignUpFormData>({
    resolver: zodResolver(customerSignUpSchema),
  });

  // 3. Business Sign Up Form Hook
  const {
    register: registerBusiness,
    handleSubmit: handleBusinessSubmit,
    formState: { errors: businessErrors },
  } = useForm<BusinessSignUpFormData>({
    resolver: zodResolver(businessSignUpSchema),
    defaultValues: {
      businessType: 'Restaurant',
      location: 'Bangalore',
    },
  });

  // Handlers
  const onLoginSubmit = (data: LoginFormData) => {
    startTransition(async () => {
      const result = await signIn(data);
      if (result && !result.success) {
        toast.error(result.error ?? 'Unable to sign in. The email or password may be incorrect.');
      }
    });
  };

  const onCustomerSignUpSubmit = (data: CustomerSignUpFormData) => {
    startTransition(async () => {
      const result = await signUpCustomer(data);
      if (result && !result.success) {
        toast.error(result.error ?? 'Failed to create customer account');
      }
    });
  };

  const onBusinessSignUpSubmit = (data: BusinessSignUpFormData) => {
    startTransition(async () => {
      const result = await signUpBusiness(data);
      if (result && !result.success) {
        toast.error(result.error ?? 'Failed to create business account');
      }
    });
  };

  const handleDemoLogin = (selectedRole: 'customer' | 'business') => {
    setDemoLoading(selectedRole);
    startTransition(async () => {
      const result = await signInAsDemo(selectedRole);
      if (result && !result.success) {
        toast.error(result.error ?? 'Demo login failed');
        setDemoLoading(null);
      }
    });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setForgotPending(true);
    const result = await sendPasswordResetEmail(forgotEmail);
    setForgotPending(false);

    if (result.success) {
      toast.success('If an account exists with this email, a password reset link has been sent.');
      setForgotPasswordOpen(false);
      setForgotEmail('');
    } else {
      toast.error(result.error || 'Failed to send reset link');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/60 flex flex-col lg:flex-row items-stretch">
      {/* ============================================================ */}
      {/* LEFT PANEL — BRANDING & VALUE PROPOSITIONS (Desktop ~48%)   */}
      {/* ============================================================ */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] bg-[#0d3322] text-white p-12 relative overflow-hidden shrink-0 border-r border-[#154631]">
        {/* Subtle Decorative Plate & Ring Motif */}
        <div className="absolute -right-24 -bottom-24 size-96 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 size-72 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute top-1/4 right-8 size-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        {/* Top: Official RePlate Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="size-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30 shadow-inner">
            <Leaf className="size-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-white block">RePlate</span>
            <span className="text-[11px] font-medium text-emerald-300/80 tracking-wide uppercase">
              Surplus Food Marketplace
            </span>
          </div>
        </div>

        {/* Middle: Brand Headline & Value Story */}
        <div className="space-y-8 my-auto py-12 z-10 max-w-lg">
          <div className="space-y-3">
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.15] text-white">
              Good food deserves<br />
              <span className="text-emerald-300">another plate.</span>
            </h1>
            <p className="text-emerald-100/90 text-lg leading-relaxed font-normal pt-1">
              Save good food. Spend less. Waste less.
            </p>
          </div>

          {/* 3 Credible Refined Benefit Cards */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-4 p-3.5 rounded-xl bg-white/[0.07] border border-white/10 backdrop-blur-sm">
              <div className="size-9 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                <Tag className="size-4" />
              </div>
              <div>
                <p className="font-semibold text-sm text-white">Up to 50% off</p>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Surplus food deals from top local restaurants, cafés & canteens.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3.5 rounded-xl bg-white/[0.07] border border-white/10 backdrop-blur-sm">
              <div className="size-9 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="size-4" />
              </div>
              <div>
                <p className="font-semibold text-sm text-white">Same-day pickup</p>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Fresh food, ready nearby. Reserve and collect before closing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3.5 rounded-xl bg-white/[0.07] border border-white/10 backdrop-blur-sm">
              <div className="size-9 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                <Leaf className="size-4" />
              </div>
              <div>
                <p className="font-semibold text-sm text-white">Less food waste</p>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Give edible, delicious food a second chance and support zero-waste campuses.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-emerald-300/70 border-t border-white/10 pt-6 z-10">
          <p>© 2026 RePlate · Helping make food waste history.</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setTermsOpen(true)}
              className="hover:text-white transition-colors"
            >
              Privacy & Terms
            </button>
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="hover:text-white transition-colors"
            >
              Help
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT PANEL — AUTHENTICATION CARD (~52%)                      */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        {/* Mobile Header Banner */}
        <div className="w-full max-w-md lg:hidden mb-6 text-center space-y-2">
          <div className="inline-flex items-center gap-2 mb-1">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Leaf className="size-5" />
            </div>
            <span className="text-xl font-bold text-foreground">RePlate</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Good food deserves another plate.</h2>
          <p className="text-xs text-muted-foreground">Save good food. Spend less. Waste less.</p>
        </div>

        <div className="w-full max-w-md space-y-5">
          {/* Subtle Segmented Switch: Sign In | Create Account */}
          <div className="p-1 rounded-xl bg-muted/70 border flex items-center shadow-inner">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={cn(
                'flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all',
                mode === 'signin'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={cn(
                'flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all',
                mode === 'signup'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Create Account
            </button>
          </div>

          <Card className="border-border/70 shadow-md bg-card overflow-hidden">
            <CardHeader className="pb-4 space-y-1">
              <CardTitle className="text-2xl font-bold text-foreground tracking-tight">
                {mode === 'signin' ? 'Welcome back' : 'Join RePlate'}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {mode === 'signin'
                  ? 'Sign in to continue to RePlate.'
                  : 'Choose how you want to use RePlate.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* ==================================================== */}
              {/* SIGN IN TAB CONTENT                                  */}
              {/* ==================================================== */}
              {mode === 'signin' ? (
                <>
                  {/* Quick Demo Access (Convenient Shortcut) */}
                  <div className="p-3 rounded-xl bg-muted/40 border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="size-3 text-primary" />
                        Quick Demo Access
                      </span>
                      <span className="text-[10px] text-muted-foreground">No password required</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10 border-primary/20 hover:border-primary hover:bg-primary/5 text-xs font-medium justify-start px-2.5"
                        onClick={() => handleDemoLogin('customer')}
                        disabled={isPending || demoLoading !== null}
                      >
                        {demoLoading === 'customer' ? (
                          <span className="size-3 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <Users className="size-3.5 text-primary mr-2 shrink-0" />
                        )}
                        <span className="truncate">Customer Demo</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10 border-primary/20 hover:border-primary hover:bg-primary/5 text-xs font-medium justify-start px-2.5"
                        onClick={() => handleDemoLogin('business')}
                        disabled={isPending || demoLoading !== null}
                      >
                        {demoLoading === 'business' ? (
                          <span className="size-3 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <Building2 className="size-3.5 text-primary mr-2 shrink-0" />
                        )}
                        <span className="truncate">Business Demo</span>
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-[11px] font-medium text-muted-foreground">
                      or sign in with email
                    </span>
                  </div>

                  {/* Sign In Email/Password Form */}
                  <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="signin-email" className="text-xs font-medium">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-9.5 h-11 text-sm"
                          autoComplete="email"
                          {...registerLogin('email')}
                        />
                      </div>
                      {loginErrors.email && (
                        <p className="text-xs text-destructive">{loginErrors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password" className="text-xs font-medium">
                          Password
                        </Label>
                        <button
                          type="button"
                          onClick={() => setForgotPasswordOpen(true)}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="pl-9.5 pr-10 h-11 text-sm"
                          autoComplete="current-password"
                          {...registerLogin('password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                      {loginErrors.password && (
                        <p className="text-xs text-destructive">{loginErrors.password.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all"
                      disabled={isPending || demoLoading !== null}
                    >
                      {isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Signing in...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Sign In
                          <ArrowRight className="size-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                /* ==================================================== */
                /* SIGN UP TAB CONTENT                                  */
                /* ==================================================== */
                <>
                  {/* Role Selector Cards */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      How will you use RePlate?
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('customer')}
                        className={cn(
                          'p-3 rounded-xl border text-left transition-all flex flex-col justify-between relative',
                          role === 'customer'
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:border-muted-foreground/30'
                        )}
                      >
                        {role === 'customer' && (
                          <CheckCircle2 className="size-3.5 text-primary absolute top-2.5 right-2.5" />
                        )}
                        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                          <ShoppingBag className="size-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-xs sm:text-sm text-foreground">
                            Customer
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                            Discover & rescue discounted surplus food.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('business')}
                        className={cn(
                          'p-3 rounded-xl border text-left transition-all flex flex-col justify-between relative',
                          role === 'business'
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:border-muted-foreground/30'
                        )}
                      >
                        {role === 'business' && (
                          <CheckCircle2 className="size-3.5 text-primary absolute top-2.5 right-2.5" />
                        )}
                        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                          <Store className="size-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-xs sm:text-sm text-foreground">
                            Business Partner
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                            Turn unsold food into recovered revenue.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <Separator />

                  {/* Customer Signup Form */}
                  {role === 'customer' ? (
                    <form
                      onSubmit={handleCustomerSubmit(onCustomerSignUpSubmit)}
                      className="space-y-3.5"
                    >
                      <div className="space-y-1">
                        <Label htmlFor="cust-name" className="text-xs font-medium">
                          Full Name *
                        </Label>
                        <Input
                          id="cust-name"
                          placeholder="e.g. Chetan Sharma"
                          className="h-10 text-sm"
                          {...registerCustomer('name')}
                        />
                        {customerErrors.name && (
                          <p className="text-xs text-destructive">{customerErrors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="cust-email" className="text-xs font-medium">
                          Email Address *
                        </Label>
                        <Input
                          id="cust-email"
                          type="email"
                          placeholder="you@example.com"
                          className="h-10 text-sm"
                          {...registerCustomer('email')}
                        />
                        {customerErrors.email && (
                          <p className="text-xs text-destructive">{customerErrors.email.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="cust-pass" className="text-xs font-medium">
                            Password *
                          </Label>
                          <div className="relative">
                            <Input
                              id="cust-pass"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Min 8 characters"
                              className="h-10 pr-9 text-sm"
                              {...registerCustomer('password')}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                            </button>
                          </div>
                          {customerErrors.password && (
                            <p className="text-xs text-destructive">
                              {customerErrors.password.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="cust-confirm" className="text-xs font-medium">
                            Confirm Password *
                          </Label>
                          <div className="relative">
                            <Input
                              id="cust-confirm"
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Re-enter password"
                              className="h-10 pr-9 text-sm"
                              {...registerCustomer('confirmPassword')}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                            </button>
                          </div>
                          {customerErrors.confirmPassword && (
                            <p className="text-xs text-destructive">
                              {customerErrors.confirmPassword.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold text-sm mt-2"
                        disabled={isPending}
                      >
                        {isPending ? 'Creating customer account...' : 'Create Customer Account'}
                      </Button>
                    </form>
                  ) : (
                    /* Business Signup Form */
                    <form
                      onSubmit={handleBusinessSubmit(onBusinessSignUpSubmit)}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="biz-owner" className="text-xs font-medium">
                            Your Name *
                          </Label>
                          <Input
                            id="biz-owner"
                            placeholder="Manager name"
                            className="h-9.5 text-sm"
                            {...registerBusiness('name')}
                          />
                          {businessErrors.name && (
                            <p className="text-xs text-destructive">{businessErrors.name.message}</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="biz-title" className="text-xs font-medium">
                            Business Name *
                          </Label>
                          <Input
                            id="biz-title"
                            placeholder="e.g. Green Leaf Café"
                            className="h-9.5 text-sm"
                            {...registerBusiness('businessName')}
                          />
                          {businessErrors.businessName && (
                            <p className="text-xs text-destructive">
                              {businessErrors.businessName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="biz-type" className="text-xs font-medium">
                            Business Type *
                          </Label>
                          <select
                            id="biz-type"
                            className="w-full h-9.5 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            {...registerBusiness('businessType')}
                          >
                            <option value="Restaurant">Restaurant</option>
                            <option value="Café">Café</option>
                            <option value="Bakery">Bakery</option>
                            <option value="College Canteen">College Canteen</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="biz-loc" className="text-xs font-medium">
                            City / Campus *
                          </Label>
                          <Input
                            id="biz-loc"
                            placeholder="e.g. Bangalore, RUAS"
                            className="h-9.5 text-sm"
                            {...registerBusiness('location')}
                          />
                          {businessErrors.location && (
                            <p className="text-xs text-destructive">
                              {businessErrors.location.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="biz-email" className="text-xs font-medium">
                          Partner Email *
                        </Label>
                        <Input
                          id="biz-email"
                          type="email"
                          placeholder="partner@restaurant.com"
                          className="h-9.5 text-sm"
                          {...registerBusiness('email')}
                        />
                        {businessErrors.email && (
                          <p className="text-xs text-destructive">{businessErrors.email.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="biz-pass" className="text-xs font-medium">
                            Password *
                          </Label>
                          <Input
                            id="biz-pass"
                            type="password"
                            placeholder="Min 8 chars"
                            className="h-9.5 text-sm"
                            {...registerBusiness('password')}
                          />
                          {businessErrors.password && (
                            <p className="text-xs text-destructive">
                              {businessErrors.password.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="biz-confirm" className="text-xs font-medium">
                            Confirm *
                          </Label>
                          <Input
                            id="biz-confirm"
                            type="password"
                            placeholder="Confirm password"
                            className="h-9.5 text-sm"
                            {...registerBusiness('confirmPassword')}
                          />
                          {businessErrors.confirmPassword && (
                            <p className="text-xs text-destructive">
                              {businessErrors.confirmPassword.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold text-sm mt-2"
                        disabled={isPending}
                      >
                        {isPending ? 'Creating business account...' : 'Create Business Account'}
                      </Button>
                    </form>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Trust Statement */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            <span>Your information stays private and secure.</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* DIALOGS / MODALS                                             */}
      {/* ============================================================ */}

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter the email address associated with your RePlate account and we will send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email Address</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setForgotPasswordOpen(false)}
                disabled={forgotPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={forgotPending}>
                {forgotPending ? 'Sending link...' : 'Send Reset Link'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>RePlate Help & Support</DialogTitle>
            <DialogDescription>How accounts and demo access work.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs md:text-sm text-muted-foreground">
            <div className="p-3 rounded-lg bg-muted/40 space-y-1">
              <p className="font-semibold text-foreground">How does Demo Access work?</p>
              <p>
                Clicking <strong>Customer Demo</strong> or <strong>Business Demo</strong> automatically logs you into an authenticated demonstration workspace with pre-populated food listings and order flows.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 space-y-1">
              <p className="font-semibold text-foreground">Contact Support</p>
              <p>
                Reach our team anytime at <strong className="text-foreground">support@replate.demo</strong>.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setHelpOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terms & Privacy Dialog */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Privacy Policy & Food Safety Terms</DialogTitle>
            <DialogDescription>Our platform commitment to safety and privacy.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs md:text-sm text-muted-foreground max-h-60 overflow-y-auto pr-1">
            <p className="font-semibold text-foreground">1. Surplus Food Integrity</p>
            <p>
              All food items listed on RePlate are certified by our partner restaurants and canteens as wholesome, safely handled, and within safe consumption windows.
            </p>
            <p className="font-semibold text-foreground">2. Account Security</p>
            <p>
              Authentication is handled securely via Supabase Auth with encrypted credentials.
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
