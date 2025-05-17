import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // Use server client for route handlers
import { z } from 'zod';

// Define the expected schema for the request body
const featureRequestSchema = z.object({
  categories: z.array(z.string()).min(1, "At least one category must be selected."),
  details: z.string().min(1, "Details cannot be empty.").max(1000, "Details must be 1000 characters or less."),
  pageUrl: z.string().optional(), // Optional: for future use
});

export async function POST(request: Request) {
  const supabase = createClient();

  // 1. Check user authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('API: Auth error or no user', authError);
    return NextResponse.json({ error: 'Unauthorized. Please sign in to submit feedback.' }, { status: 401 });
  }

  // 2. Parse and validate request body
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsedRequest = featureRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return NextResponse.json({ error: 'Invalid input.', issues: parsedRequest.error.issues }, { status: 400 });
  }

  const { categories, details, pageUrl } = parsedRequest.data;

  // 3. Prepare data for Supabase
  const feedbackData = {
    user_id: user.id,
    categories: categories,
    details: details,
    page_url: pageUrl || request.headers.get('referer'), // Capture referer URL if pageUrl not provided
    user_agent: request.headers.get('user-agent'), // Capture user agent
    // status and rating will use database defaults or can be added later
  };

  // 4. Insert into Supabase
  try {
    const { data, error: insertError } = await supabase
      .from('user_feedback')
      .insert(feedbackData)
      .select()
      .single(); // Assuming you want the inserted row back

    if (insertError) {
      console.error('API: Supabase insert error', insertError);
      // Provide a more specific error message if possible
      let errorMessage = 'Failed to submit feedback.';
      if (insertError.message.includes('check constraint')) {
          errorMessage = 'Input validation failed. Please check your submission.';
      } else if (insertError.message.includes('foreign key constraint')) {
          errorMessage = 'Error linking feedback to user account.';
      }
      return NextResponse.json({ error: errorMessage, details: insertError.message }, { status: 500 });
    }

    console.log('API: Feedback submitted successfully', data);
    return NextResponse.json({ message: 'Feedback submitted successfully!', data }, { status: 201 });

  } catch (error) {
    console.error('API: Unexpected error during submission', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
} 