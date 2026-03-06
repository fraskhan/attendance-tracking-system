#!/usr/bin/env node

/**
 * Direct Migration Runner Script
 * Runs migrations by executing SQL directly through Supabase REST API
 */

require('dotenv').config();
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

// Migration files in order
const migrations = [
  '001_initial_schema.sql',
  '002_storage_setup.sql',
  '003_enable_rls.sql'
];

async function executeSql(sql) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return await response.json();
}

async function runMigration(filename) {
  const filePath = path.join(__dirname, '..', 'supabase', 'migrations', filename);
  
  console.log(`\n📄 Running migration: ${filename}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`   ❌ File not found: ${filePath}`);
    return false;
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  
  try {
    await executeSql(sql);
    console.log(`   ✅ Successfully executed ${filename}`);
    return true;
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
    console.error(`\n   💡 You can run this migration manually:`);
    console.error(`      1. Go to: https://app.supabase.com/project/_/sql`);
    console.error(`      2. Copy contents of: supabase/migrations/${filename}`);
    console.error(`      3. Paste and click "Run"`);
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
    console.log('\n⚠️  Some migrations failed.');
    console.log('\n📝 Manual Migration Instructions:');
    console.log('   1. Go to Supabase SQL Editor: https://app.supabase.com/project/_/sql');
    console.log('   2. For each failed migration:');
    console.log('      - Open the file in supabase/migrations/');
    console.log('      - Copy the entire contents');
    console.log('      - Paste into SQL Editor');
    console.log('      - Click "Run"');
    process.exit(1);
  } else {
    console.log('\n🎉 All migrations completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Verify setup: Check tables in Supabase dashboard');
    console.log('   2. Run validation tests: npm run db:test');
    console.log('   3. Continue with task execution');
  }
}

// Run migrations
runAllMigrations().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
