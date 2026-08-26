import Link from 'next/link';
import { Leaf, ShieldCheck, Heart } from 'lucide-react';
import { REPLATE_BRAND_NAME } from '@/lib/constants/legal';

export function SiteFooter() {
  return (
    <footer className="bg-card border-t border-border/70 text-foreground py-12 px-4 sm:px-8 mt-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <Leaf className="size-4" />
              </div>
              <span className="font-bold text-lg tracking-tight">{REPLATE_BRAND_NAME}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Good food deserves another plate. Connecting local food businesses with conscious consumers to rescue surplus food.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
              <ShieldCheck className="size-3.5" />
              <span>FSSAI & DPDP Compliant</span>
            </div>
          </div>

          {/* Marketplace Col */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Marketplace</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/customer/explore" className="hover:text-primary transition-colors">
                  Explore Surplus Food
                </Link>
              </li>
              <li>
                <Link href="/customer/orders" className="hover:text-primary transition-colors">
                  My Orders & Pickups
                </Link>
              </li>
              <li>
                <Link href="/customer/profile" className="hover:text-primary transition-colors">
                  Customer Account
                </Link>
              </li>
              <li>
                <Link href="/business" className="hover:text-primary transition-colors">
                  Partner Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance Col */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Legal & Policies</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy (DPDP)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/food-safety" className="hover:text-primary transition-colors">
                  Food Safety & Hygiene
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-primary transition-colors">
                  Refund & Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Partners Col */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Support & Partners</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/grievance" className="hover:text-primary transition-colors">
                  Grievance Redressal Officer
                </Link>
              </li>
              <li>
                <Link href="/business-terms" className="hover:text-primary transition-colors">
                  Business Partner Agreement
                </Link>
              </li>
              <li>
                <Link href="/business/profile" className="hover:text-primary transition-colors">
                  Store FSSAI Settings
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Sign In / Demo Access
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 {REPLATE_BRAND_NAME} · Helping make food waste history.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/food-safety" className="hover:underline">Food Safety</Link>
            <Link href="/grievance" className="hover:underline">Grievance</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
