// ============================================================
// RePlate — Supabase Middleware Client
// ============================================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route protection logic
  const path = request.nextUrl.pathname;

  // If not logged in and trying to access protected routes
  if (!user && (path.startsWith('/customer') || path.startsWith('/business'))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If logged in, fetch profile to check role
  if (user && (path.startsWith('/customer') || path.startsWith('/business'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile) {
      // Business user trying to access customer routes
      if (profile.role === 'business' && path.startsWith('/customer')) {
        const url = request.nextUrl.clone();
        url.pathname = '/business';
        return NextResponse.redirect(url);
      }
      // Customer trying to access business routes
      if (profile.role === 'customer' && path.startsWith('/business')) {
        const url = request.nextUrl.clone();
        url.pathname = '/customer';
        return NextResponse.redirect(url);
      }
    }
  }

  // Redirect logged-in users away from login page
  if (user && path === '/login') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const url = request.nextUrl.clone();
    url.pathname = profile?.role === 'business' ? '/business' : '/customer';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
