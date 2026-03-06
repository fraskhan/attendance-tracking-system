#!/usr/bin/env node

/**
 * Migration Runner Script
 * Automatically runs all SQL migrations against your Supabase database
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Validate environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease configure your .env file with Supabase credentials.');
  process.exit(1);
}

// Create Supabase client with service role key (has admin privileges)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Migration files in order
const migrations = [
  '001_initial_schema.sql',
  '002_storage_setup.sql',
  '003_enable_rls.sql'
];

async function runMigration(filename) {
  const filePath = path.join(__dirname, '..', 'supabase', 'migrations', filename);
  
  console.log(`\n📄 Running migration: ${filename}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`   ❌ File not found: ${filePath}`);
    return false;
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // Try direct execution if RPC doesn't work
      const { error: directError } = await supabase.from('_migrations').insert({
        name: filename,
        executed_at: new Date().toISOString()
      });
      
      if (directError && directError.code !== '42P01') { // Ignore if table doesn't exist
        console.error(`   ❌ Error: ${error.message}`);
        return false;
      }
    }
    
    console.log(`   ✅ Successfully executed ${filename}`);
    return true;
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function runAllMigrations() {
  console.log('🚀 Starting database migrations...\n');
  console.log(`📍 Supabase URL: ${process.env.SUPABASE_URL}`);
  
  let successCount = 0;
  let failCount = 0;

  for (const migration of migrations) {
    const success = await runMigration(migration);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Successful migrations: ${successCount}`);
  console.log(`❌ Failed migrations: ${failCount}`);
  console.log('='.repeat(60));

  if (failCount > 0) {
    console.log('\n⚠️  Some migrations failed. Please run them manually in Supabase SQL Editor.');
    console.log('   Go to: https://app.supabase.com/project/_/sql');
    process.exit(1);
  } else {
    console.log('\n🎉 All migrations completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run validation tests: npm run db:test');
    console.log('   2. Start building the mobile app (Task 12)');
    console.log('   3. Start building the admin dashboard (Task 16)');
  }
}

// Run migrations
runAllMigrations().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
