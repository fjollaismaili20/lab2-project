#!/usr/bin/env node

// Manual database seeding script
// Usage: node scripts/seed.js [--force]

import { seedDatabase, isDatabaseEmpty } from '../database/seeder.js';
import { postgresConnection } from '../database/postgresdb.js';
import { initializeDatabase } from '../database/postgresSchemas.js';

const args = process.argv.slice(2);
const forceSeeding = args.includes('--force');

const runSeeder = async () => {
    try {
        console.log('🔌 Connecting to PostgreSQL database...');
        await postgresConnection();
        await initializeDatabase();
        
        if (forceSeeding) {
            console.log('⚠️  Force seeding enabled - seeding regardless of current data');
            // Temporarily override isEmpty check for force seeding
            const originalIsDatabaseEmpty = isDatabaseEmpty;
            global.isDatabaseEmpty = async () => true;
            await seedDatabase();
        } else {
            const isEmpty = await isDatabaseEmpty();
            if (isEmpty) {
                await seedDatabase();
            } else {
                console.log('ℹ️  Database already contains data. Use --force to seed anyway.');
                console.log('   Warning: Force seeding may create duplicate data.');
            }
        }
        
        console.log('✅ Seeding process completed');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

console.log('🌱 Database Seeder');
console.log('==================');
runSeeder();
