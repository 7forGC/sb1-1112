import { migrateToSupabase } from './migrateToSupabase';
import { readFileSync } from 'fs';

async function runMigration() {
  try {
    // Read Firebase export data
    const data = JSON.parse(readFileSync('firebase-export.json', 'utf8'));
    
    // Start migration
    await migrateToSupabase.migrateAll(data);
  } catch (error) {
    console.error('Migration script failed:', error);
    process.exit(1);
  }
}

runMigration();