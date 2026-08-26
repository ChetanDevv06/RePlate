'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { signOut } from '@/app/actions/auth';

export function CustomerProfileActions() {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <Button
      variant="outline"
      className="w-full text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
      onClick={handleSignOut}
      disabled={isPending}
    >
      <LogOut className="size-4 mr-2" />
      {isPending ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
}
