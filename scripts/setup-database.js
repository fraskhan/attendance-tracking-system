#!/usr/bin/env node

/**
 * Database Setup Script
 * Uses Supabase Management API to run migrations
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extract project ref from URL
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Invalid SUPABASE_URL format');
  process.exit(1);
}

const migrations = [
  '001_initial_schema.sql',
  '002_storage_setup.sql',
  '003_enable_rls.sql'
];

async function executeSqlQuery(sql) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ sql })
    });

    const text = await response.text();
    
    if (!response.ok) {
      return { success: false, error: text };
    }

    return { success: true, data: text };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runMigration(filename) {
  const filePath = path.join(__dirname, '..', 'supabase', 'migrations', filename);
  
  console.log(`\n📄 ${filename}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`   ❌ File not found`);
    return false;
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    const result = await executeSqlQuery(statement);
    
    if (!result.success) {
      // Some errors are expected (like "already exists")
      if (result.error.includes('already exists') || 
          result.error.includes('duplicate') ||
          result.error.includes('does not exist')) {
        console.log(`   ⚠️  Statement ${i + 1}: ${result.error.substring(0, 60)}...`);
      } else {
        console.error(`   ❌ Statement ${i + 1}: ${result.error.substring(0, 100)}...`);
        errorCount++;
      }
    } else {
      successCount++;
    }
  }

  if (errorCount === 0) {
    console.log(`   ✅ Completed (${successCount} statements)`);
    return true;
  } else {
    console.log(`   ⚠️  Completed with ${errorCount} errors`);
    return false;
  }
}

async function main() {
  console.log('🚀 Database Setup\n');
  console.log(`📍 Project: ${projectRef}`);
  console.log(`🔗 URL: ${SUPABASE_URL}\n`);
  console.log('Running migrations...');

  let allSuccess = true;

  for (const migration of migrations) {
    const success = await runMigration(migration);
    if (!success) allSuccess = false;
  }

  console.log('\n' + '='.repeat(60));
  
  if (allSuccess) {
    console.log('✅ Database setup complete!\n');
    console.log('📋 Next steps:');
    console.log('   1. Verify in Supabase dashboard:');
    console.log(`      https://app.supabase.com/project/${projectRef}/editor`);
    console.log('   2. Check tables: organizations, users, time_logs');
    console.log('   3. Check storage bucket: attendance-photos');
    console.log('   4. Continue with task execution\n');
  } else {
    console.log('⚠️  Setup completed with some warnings\n');
    console.log('💡 If you see errors, you can run migrations manually:');
    console.log(`   https://app.supabase.com/project/${projectRef}/sql\n`);
  }
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
