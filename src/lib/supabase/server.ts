import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type CookieOptions } from '@supabase/ssr'
import { Database } from '@/lib/types/database.types'

export function createClient() {
  try {
    const cookieStore = cookies()

    // Check if environment variables are defined
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase environment variables are not defined')
      throw new Error('Supabase configuration is missing')
    }

    return createServerClient<Database>(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) {
            try {
              return cookieStore.get(name)?.value
            } catch (error) {
              console.error('Error getting cookie:', error)
              return undefined
            }
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              console.error('Error setting cookie:', error)
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              console.error('Error removing cookie:', error)
            }
          },
        },
      }
    )
  } catch (error) {
    console.error('Error creating Supabase server client:', error)
    throw error
  }
}
