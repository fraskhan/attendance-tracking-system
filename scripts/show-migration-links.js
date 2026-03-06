#!/usr/bin/env node

/**
 * Quick helper to show migration links and instructions
 */

require('dotenv').config();

const projectRef = process.env.SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project reference from SUPABASE_URL');
  process.exit(1);
}

console.log('\n🚀 Database Migration Helper\n');
console.log('=' .repeat(70));
console.log('\n📍 Your Supabase Project:', projectRef);
console.log('🔗 SQL Editor:', `https://app.supabase.com/project/${projectRef}/sql`);
console.log('\n' + '='.repeat(70));

console.log('\n📋 STEP-BY-STEP INSTRUCTIONS:\n');

console.log('1️⃣  Open SQL Editor (click link above or copy URL)');
console.log('    → Click "New Query"\n');

console.log('2️⃣  Run Migration 1: Initial Schema');
console.log('    → Open: supabase/migrations/001_initial_schema.sql');
console.log('    → Copy ALL contents');
console.log('    → Paste in SQL Editor');
console.log('    → Click "Run" (or Ctrl+Enter)');
console.log('    → ✅ Should see "Success"\n');

console.log('3️⃣  Run Migration 2: Storage Setup');
console.log('    → Open: supabase/migrations/002_storage_setup.sql');
console.log('    → Copy ALL contents');
console.log('    → Paste in SQL Editor');
console.log('    → Click "Run"');
console.log('    → ✅ Should see "Success"\n');

console.log('4️⃣  Run Migration 3: Enable RLS');
console.log('    → Open: supabase/migrations/003_enable_rls.sql');
console.log('    → Copy ALL contents');
console.log('    → Paste in SQL Editor');
console.log('    → Click "Run"');
console.log('    → ✅ Should see "Success"\n');

console.log('=' .repeat(70));
console.log('\n✅ VERIFICATION:\n');

console.log('After running migrations, verify:');
console.log(`  • Tables: https://app.supabase.com/project/${projectRef}/editor`);
console.log('    → Should see: organizations, users, time_logs');
console.log(`  • Storage: https://app.supabase.com/project/${projectRef}/storage/buckets`);
console.log('    → Should see: attendance-photos bucket');
console.log(`  • Policies: https://app.supabase.com/project/${projectRef}/auth/policies`);
console.log('    → Should see: 12 policies total\n');

console.log('=' .repeat(70));
console.log('\n💡 TIP: Keep this terminal open for reference!\n');
console.log('When done, type: "Migrations complete" in chat\n');
