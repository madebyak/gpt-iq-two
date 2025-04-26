// Supabase Diagnostics Script
// Run with: node scripts/supabase-diagnostics.js

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with explicit configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Display environment variables (with partial keys for security)
console.log('=== Environment Variables ===');
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`);
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? supabaseAnonKey.substring(0, 15) + '...' : 'undefined'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? supabaseServiceKey.substring(0, 15) + '...' : 'undefined'}`);
console.log('\n');

// Create both anonymous and service role clients
const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

async function runDiagnostics() {
  try {
    console.log('=== Testing Supabase Connection ===');
    
    // 1. Test basic connection with anon key
    console.log('1. Testing anonymous client connection...');
    const { data: healthData, error: healthError } = await anonClient.rpc('extensions');
    if (healthError) {
      console.error('  ❌ Connection failed:', healthError);
    } else {
      console.log('  ✅ Connection successful');
    }
    
    // 2. Test auth functionality
    console.log('\n2. Testing auth API access...');
    try {
      const { data: configData, error: configError } = await anonClient.auth.getSession();
      if (configError) {
        console.error('  ❌ Auth API access failed:', configError);
      } else {
        console.log('  ✅ Auth API accessible');
      }
    } catch (e) {
      console.error('  ❌ Auth API access failed with exception:', e);
    }
    
    // 3. Test creating a temporary user with service role
    console.log('\n3. Testing user creation with service role...');
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    try {
      const { data: signUpData, error: signUpError } = await serviceClient.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true // Auto-confirm for testing
      });
      
      if (signUpError) {
        console.error('  ❌ User creation failed:', signUpError);
        console.log('  Details:', JSON.stringify(signUpError, null, 2));
      } else {
        console.log('  ✅ Test user created successfully:', signUpData.user.email);
        
        // 4. Now check if we can query the newly created user
        console.log('\n4. Verifying user exists in auth.users...');
        const { data: userData, error: userError } = await serviceClient.auth.admin.listUsers();
        
        if (userError) {
          console.error('  ❌ Failed to list users:', userError);
        } else {
          const createdUser = userData.users.find(u => u.email === testEmail);
          if (createdUser) {
            console.log('  ✅ User exists in auth.users');
          } else {
            console.error('  ❌ Created user not found in auth.users list');
          }
        }
        
        // 5. Check if profiles table exists and is accessible
        console.log('\n5. Testing profiles table access...');
        const { data: tableData, error: tableError } = await serviceClient
          .from('profiles')
          .select('*')
          .limit(1);
        
        if (tableError) {
          console.error('  ❌ Profiles table access failed:', tableError);
          console.log('  Details:', JSON.stringify(tableError, null, 2));
          
          // Check if table exists
          console.log('\n5a. Checking if profiles table exists...');
          const { data: schemaData, error: schemaError } = await serviceClient.rpc(
            'list_tables', 
            { schema_name: 'public' }
          );
          
          if (schemaError) {
            console.error('  ❌ Failed to check table schema:', schemaError);
          } else {
            const profilesTable = schemaData?.find(table => table.table_name === 'profiles');
            console.log(profilesTable 
              ? '  ✅ Profiles table exists in database' 
              : '  ❌ Profiles table does not exist in database');
          }
        } else {
          console.log('  ✅ Profiles table is accessible');
          console.log('  Sample data:', tableData.length > 0 ? '(data found)' : '(no rows returned)');
        }
        
        // 6. Test profile creation manually
        console.log('\n6. Testing manual profile creation...');
        if (signUpData && signUpData.user) {
          try {
            const { data: profileData, error: profileError } = await serviceClient
              .from('profiles')
              .insert({
                id: signUpData.user.id,
                email: signUpData.user.email,
                first_name: 'Test',
                last_name: 'User',
                preferred_language: 'en',
                preferred_theme: 'system',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select();
            
            if (profileError) {
              console.error('  ❌ Profile creation failed:', profileError);
              console.log('  Details:', JSON.stringify(profileError, null, 2));
              
              // Check table structure
              console.log('\n6a. Checking profiles table structure...');
              const { data: columnsData, error: columnsError } = await serviceClient.rpc(
                'list_columns', 
                { table_name: 'profiles', schema_name: 'public' }
              );
              
              if (columnsError) {
                console.error('  ❌ Failed to check table structure:', columnsError);
              } else {
                console.log('  ✅ Profiles table columns:');
                columnsData.forEach(col => {
                  console.log(`     - ${col.column_name} (${col.data_type})${col.is_nullable === 'NO' ? ' [REQUIRED]' : ''}`);
                });
              }
            } else {
              console.log('  ✅ Profile created successfully');
            }
          } catch (profileCreateError) {
            console.error('  ❌ Exception during profile creation:', profileCreateError);
          }
        }
        
        // 7. Clean up the test user
        console.log('\n7. Cleaning up test user...');
        const { error: deleteError } = await serviceClient.auth.admin.deleteUser(signUpData.user.id);
        
        if (deleteError) {
          console.error('  ❌ Failed to delete test user:', deleteError);
        } else {
          console.log('  ✅ Test user deleted successfully');
        }
      }
    } catch (e) {
      console.error('  ❌ Exception during user creation test:', e);
    }
    
    console.log('\n=== Diagnostics Complete ===');
    
  } catch (error) {
    console.error('Diagnostic error:', error);
  }
}

// Execute the diagnostics
runDiagnostics();
