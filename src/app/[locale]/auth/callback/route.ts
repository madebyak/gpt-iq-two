import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Auth callback route handler
 * This handles the redirect after OAuth authentication from providers like Google
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin;

  // If there's no code, redirect to the login page
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  try {
    const supabase = createClient();

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${origin}/auth/login?error=auth-callback-error`);
    }

    // Redirect to the home page
    return NextResponse.redirect(origin);
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(`${origin}/auth/login?error=auth-callback-error`);
  }
}
