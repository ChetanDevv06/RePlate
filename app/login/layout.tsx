import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In — RePlate',
  description: 'Sign in to RePlate to save good food and reduce waste.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
