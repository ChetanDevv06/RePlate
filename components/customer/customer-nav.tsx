'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ClipboardList, UserCircle, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from '@/app/actions/auth';
import { useTransition } from 'react';

const navItems = [
  { href: '/customer', icon: Home, label: 'Home', exact: true },
  { href: '/customer/explore', icon: Search, label: 'Explore' },
  { href: '/customer/orders', icon: ClipboardList, label: 'My Orders' },
  { href: '/customer/profile', icon: UserCircle, label: 'Profile' },
];

export function CustomerTopNav({ userName }: { userName?: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-card/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/customer" className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="size-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-primary">RePlate</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                  active
                    ? 'nav-link-active'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <item.icon className="size-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        {userName && (
          <span className="hidden md:block text-xs text-muted-foreground">
            Hi, {userName.split(' ')[0]}
          </span>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border/50 z-50">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className={cn('size-5', active ? 'text-primary' : '')} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
