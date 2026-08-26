'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Mail, Lock, Leaf, ArrowRight, Users, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { signIn, signInAsDemo } from '@/app/actions/auth';
import { loginSchema, type LoginFormData } from '@/lib/validations';

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [demoLoading, setDemoLoading] = useState<'customer' | 'business' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    startTransition(async () => {
      const result = await signIn(data);
      if (result && !result.success) {
        toast.error(result.error ?? 'Sign in failed');
      }
    });
  };

  const handleDemoLogin = (role: 'customer' | 'business') => {
    setDemoLoading(role);
    startTransition(async () => {
      const result = await signInAsDemo(role);
      if (result && !result.success) {
        toast.error(result.error ?? 'Demo login failed');
        setDemoLoading(null);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-primary p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Leaf className="size-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">RePlate</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Good food deserves<br />another plate.
          </h1>
          <p className="text-green-200 text-lg leading-relaxed">
            Save good food. Spend less. Waste less.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { title: 'Up to 50% Off', desc: 'Surplus food deals' },
              { title: 'Same-Day', desc: 'Fresh local pickup' },
              { title: 'Zero Waste', desc: 'For canteens & cafés' },
            ].map((item) => (
              <div key={item.title} className="bg-white/10 rounded-xl p-4">
                <div className="text-lg font-bold">{item.title}</div>
                <div className="text-xs text-green-200 mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-green-300 text-sm">
          © 2026 RePlate · Making food waste history.
        </p>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden mb-8">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="size-4 text-white" />
            </div>
            <span className="text-lg font-bold text-primary">RePlate</span>
          </div>

          <Card className="shadow-lg border-border/50">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>Sign in to your RePlate account</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Demo Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-11 border-primary/30 hover:bg-primary/5 hover:border-primary text-sm"
                  onClick={() => handleDemoLogin('customer')}
                  disabled={isPending || demoLoading !== null}
                >
                  {demoLoading === 'customer' ? (
                    <span className="flex items-center gap-2">
                      <span className="size-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Users className="size-4 text-primary" />
                      Customer Demo
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="h-11 border-primary/30 hover:bg-primary/5 hover:border-primary text-sm"
                  onClick={() => handleDemoLogin('business')}
                  disabled={isPending || demoLoading !== null}
                >
                  {demoLoading === 'business' ? (
                    <span className="flex items-center gap-2">
                      <span className="size-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Building2 className="size-4 text-primary" />
                      Business Demo
                    </span>
                  )}
                </Button>
              </div>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                  or sign in with email
                </span>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-9 h-11"
                      autoComplete="email"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9 h-11"
                      autoComplete="current-password"
                      {...register('password')}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold"
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
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Demo accounts available — use the buttons above to explore RePlate.
          </p>
        </div>
      </div>
    </div>
  );
}
