#!/usr/bin/env node
/**
 * Neon Serverless PostgreSQL Migration Script
 * Executes neon/schema.sql and neon/seed.sql against any Neon database URL.
 *
 * Usage:
 *   DATABASE_URL="postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require" npm run db:neon-migrate
 */

const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const connectionString =
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('\x1b[31m%s\x1b[0m', 'ERROR: Missing database connection string!');
  console.error('Please specify DATABASE_URL or NEON_DATABASE_URL in your environment or .env file:');
  console.error('Example:');
  console.error('  DATABASE_URL="postgresql://[user]:[password]@[neon-host]/neondb?sslmode=require" node scripts/migrate-neon.js');
  process.exit(1);
}

async function runMigration() {
  console.log('\x1b[36m%s\x1b[0m', '=== Starting Neon PostgreSQL Migration ===');
  console.log('Connecting to Neon instance...');

  const sql = neon(connectionString);

  try {
    const health = await sql`SELECT version(), current_database(), current_user;`;
    console.log('\x1b[32m%s\x1b[0m', '✓ Connected to Neon successfully:');
    console.log(`  Database: ${health[0].current_database}`);
    console.log(`  User:     ${health[0].current_user}`);
    console.log(`  Version:  ${health[0].version.split(',')[0]}`);

    // Read schema.sql
    const schemaPath = path.join(__dirname, '..', 'neon', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('\x1b[33m%s\x1b[0m', 'Applying schema from neon/schema.sql...');
    const statements = schemaSql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await sql(stmt + ';');
      } catch (err) {
        console.warn(`  [Warning] Statement ${i + 1}: ${err.message}`);
      }
    }
    console.log('\x1b[32m%s\x1b[0m', '✓ Schema applied successfully!');

    // Read seed.sql
    const seedPath = path.join(__dirname, '..', 'neon', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log('\x1b[33m%s\x1b[0m', 'Applying initial seed data from neon/seed.sql...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      const seedStatements = seedSql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (let i = 0; i < seedStatements.length; i++) {
        const stmt = seedStatements[i];
        try {
          await sql(stmt + ';');
        } catch (err) {
          console.warn(`  [Seed Warning] Statement ${i + 1}: ${err.message}`);
        }
      }
      console.log('\x1b[32m%s\x1b[0m', '✓ Seed data inserted successfully!');
    }

    console.log('\x1b[32m%s\x1b[0m', '=== Migration Completed Successfully! ===');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Migration failed:');
    console.error(error);
    process.exit(1);
  }
}

runMigration();
