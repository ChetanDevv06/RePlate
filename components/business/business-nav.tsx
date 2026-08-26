'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  BarChart3,
  UserCircle,
  Leaf,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { signOut } from '@/app/actions/auth';
import { useState, useTransition } from 'react';

const navItems = [
  { href: '/business', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/business/listings', icon: UtensilsCrossed, label: 'Listings' },
  { href: '/business/orders', icon: ClipboardList, label: 'Orders' },
  { href: '/business/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/business/profile', icon: UserCircle, label: 'Profile' },
];

interface BusinessNavProps {
  businessName?: string;
}

function NavLinks({ businessName, onClose }: { businessName?: string; onClose?: () => void }) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border/50">
        <div className="size-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Leaf className="size-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-primary leading-tight">RePlate</div>
          <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
            {businessName ?? 'Business Portal'}
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'nav-link-active shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className={cn('size-4 shrink-0', active ? 'text-primary' : '')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="px-3 pb-4 border-t border-border/50 pt-4">
        <button
          onClick={handleSignOut}
          disabled={isPending}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted w-full transition-all duration-150"
        >
          <LogOut className="size-4 shrink-0" />
          {isPending ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}

export function BusinessSidebar({ businessName }: BusinessNavProps) {
  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border/50 bg-card h-screen sticky top-0">
      <NavLinks businessName={businessName} />
    </aside>
  );
}

export function BusinessMobileNav({ businessName }: BusinessNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const currentPage = navItems.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  );

  return (
    <header className="lg:hidden sticky top-0 z-50 border-b border-border/50 bg-card/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
          <Leaf className="size-3.5 text-white" />
        </div>
        <span className="text-sm font-bold text-primary">RePlate</span>
        {currentPage && (
          <>
            <span className="text-muted-foreground text-xs">/</span>
            <span className="text-xs font-medium text-foreground">{currentPage.label}</span>
          </>
        )}
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-transparent hover:bg-muted transition-all"
          aria-label="Open menu"
        >
          <Menu className="size-4" />
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-56">
          <NavLinks businessName={businessName} onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
