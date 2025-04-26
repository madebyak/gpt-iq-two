// Database Schema Check Script
// This will show us what your actual database structure looks like
// Run with: node scripts/check-db-schema.js

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create service client
const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  try {
    console.log('Checking database schema...');
    
    // List all tables in the public schema
    console.log('\n=== Tables in public schema ===');
    const { data: tables, error: tablesError } = await serviceClient.rpc(
      'list_tables',
      { schema_name: 'public' }
    );
    
    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      
      // Try alternative method
      console.log('Trying alternative method to list tables...');
      const { data: altTables, error: altError } = await serviceClient
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
      
      if (altError) {
        console.error('Alternative method failed too:', altError);
      } else {
        console.log('Tables found:', altTables.map(t => t.tablename).join(', '));
      }
    } else {
      console.log('Tables found:', tables.map(t => t.table_name).join(', '));
      
      // For each table, get its structure
      for (const table of tables) {
        const tableName = table.table_name;
        console.log(`\n=== Structure of table: ${tableName} ===`);
        
        try {
          // Get columns for this table
          const { data: columns, error: columnsError } = await serviceClient.rpc(
            'list_columns',
            { table_name: tableName, schema_name: 'public' }
          );
          
          if (columnsError) {
            console.error(`Error fetching columns for ${tableName}:`, columnsError);
            
            // Try alternative method
            console.log('Trying alternative method...');
            const { data: sampleData, error: sampleError } = await serviceClient
              .from(tableName)
              .select('*')
              .limit(1);
            
            if (sampleError) {
              console.error('Sample data fetch failed:', sampleError);
            } else if (sampleData && sampleData.length > 0) {
              console.log('Columns (inferred from data):');
              const firstRow = sampleData[0];
              Object.keys(firstRow).forEach(col => {
                console.log(`  - ${col}: ${typeof firstRow[col]} ${firstRow[col] === null ? '[nullable]' : ''}`);
              });
            } else {
              console.log('No data in table to infer columns');
            }
          } else {
            console.log('Columns:');
            columns.forEach(col => {
              console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '[required]' : '[nullable]'}`);
            });
          }
        } catch (e) {
          console.error(`Error examining table ${tableName}:`, e);
        }
      }
    }
    
    // Check if profiles table exists specifically
    console.log('\n=== Checking for profiles table ===');
    try {
      const { data: profilesCheck, error: profilesError } = await serviceClient
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profilesError) {
        console.error('Error checking profiles table:', profilesError);
        console.log('Profiles table may not exist or has permission issues');
      } else {
        console.log('Profiles table exists and is accessible');
        console.log('Sample structure (inferred from data):');
        
        if (profilesCheck && profilesCheck.length > 0) {
          const firstRow = profilesCheck[0];
          Object.keys(firstRow).forEach(col => {
            console.log(`  - ${col}: ${typeof firstRow[col]} ${firstRow[col] === null ? '[nullable]' : ''}`);
          });
        } else {
          console.log('No profile records found to infer structure');
        }
      }
    } catch (e) {
      console.error('Exception checking profiles table:', e);
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

// Run the schema check
checkSchema();
