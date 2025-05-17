import { createSupabaseServerClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Auth callback route handler
 * This handles the redirect after OAuth authentication from providers like Google
 */
export async function GET(request: NextRequest) {
  // Add logging here
  console.log(`>>> Auth Callback Received: ${request.url}`);

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin;

  // If there's no code, redirect to the login page
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  try {
    const supabase = createSupabaseServerClient();

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${origin}/auth/login?error=auth-callback-error`);
    }

    // After successful authentication, check if the user has a profile
    // and create one if it doesn't exist (for OAuth flows)
    if (data?.session?.user) {
      const user = data.session.user;
      // Log the user ID we are about to process
      console.log(`>>> Processing profile check/insert for User ID: ${user.id}`); 
      
      console.log(`>>> Checking for existing profile...`);
      // Check if profile exists
      const { data: profileData, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      console.log(`>>> Profile check complete. profileData: ${profileData ? 'Found' : 'Not Found'}, profileCheckError: ${profileCheckError?.message || 'None'}`);
      
      // Explicitly handle errors during profile check
      if (profileCheckError && profileCheckError.code !== 'PGRST116') { // PGRST116 is "Not found" error
        console.error('>>> FATAL: Error checking for existing profile (not PGRST116):', profileCheckError);
        // Redirect to login with a specific error if the SELECT fails unexpectedly
        return NextResponse.redirect(`${origin}/auth/login?error=profile-select-failed&db_error=${profileCheckError.code}`);
      }
      
      // If profile doesn't exist, create one
      if (!profileData) {
        console.log(`>>> Profile not found for User ID: ${user.id}. Attempting INSERT.`);
        // Extract name from user metadata or user.user_metadata
        const firstName = user.user_metadata?.first_name || 
          user.user_metadata?.full_name?.split(' ')[0] || 
          user.user_metadata?.name?.split(' ')[0] || 
          null;
        
        const lastName = user.user_metadata?.last_name || 
          (user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || null) ||
          (user.user_metadata?.name?.split(' ').slice(1).join(' ') || null);
          
        // Create the profile - exactly matching your database schema
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            // id: user.id, // <-- DIAGNOSTIC: Temporarily removed
            first_name: firstName,
            last_name: lastName,
            email: user.email || '',
            photo_url: user.user_metadata?.avatar_url || null,
            preferred_language: 'en',
            preferred_theme: 'system',
            is_active: true,
            last_login: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_deleted: false,
            token_usage: 0,
            deleted_at: null,
            chat_settings: null,
            privacy_settings: null
          });
        
        console.log(`>>> Profile INSERT attempted.`);
        if (insertError) {
          console.error('>>> FATAL: Error creating profile in callback:', insertError);
          // Redirect to login with specific error on INSERT failure
          return NextResponse.redirect(`${origin}/auth/login?error=profile-insert-failed&db_error=${insertError.code || 'UNKNOWN'}`);
        } else {
          console.log('>>> Profile created successfully in callback.');
        }
      } else {
        // Profile was found, log this and proceed
        console.log(`>>> Profile FOUND for User ID: ${user.id}. Skipping INSERT.`);
      }
    }

    // Redirect to the home page on success
    console.log(`>>> Auth callback successful for User ID: ${data?.session?.user?.id}. Redirecting to origin.`);
    return NextResponse.redirect(origin);
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(`${origin}/auth/login?error=auth-callback-error`);
  }
}
