#!/usr/bin/env node

// Database cleanup script - Drops all data from tables
// Usage: node scripts/cleanup.js [--confirm]

import { pool } from '../database/postgresSchemas.js';
import { postgresConnection } from '../database/postgresdb.js';
import readline from 'readline';

const args = process.argv.slice(2);
const skipConfirmation = args.includes('--confirm');

// Tables in order of deletion (respecting foreign key constraints)
const TABLES_TO_CLEAN = [
    'applications',  // Has foreign keys to users and jobs
    'jobs',         // Has foreign key to users
    'companies',    // Independent table
    'users'         // Referenced by other tables
];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askConfirmation = () => {
    return new Promise((resolve) => {
        rl.question('⚠️  This will DELETE ALL DATA from the database. Are you sure? (yes/no): ', (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
        });
    });
};

const getTableCounts = async (client) => {
    const counts = {};
    for (const table of TABLES_TO_CLEAN) {
        try {
            const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
            counts[table] = parseInt(result.rows[0].count);
        } catch (error) {
            counts[table] = 0; // Table might not exist
        }
    }
    return counts;
};

const cleanupDatabase = async () => {
    try {
        console.log('🔌 Connecting to PostgreSQL database...');
        await postgresConnection();
        
        const client = await pool.connect();
        
        try {
            // Get current counts
            console.log('\n📊 Current database state:');
            const beforeCounts = await getTableCounts(client);
            let totalRecords = 0;
            
            for (const [table, count] of Object.entries(beforeCounts)) {
                console.log(`   • ${table}: ${count} records`);
                totalRecords += count;
            }
            
            if (totalRecords === 0) {
                console.log('\n✅ Database is already empty. Nothing to clean.');
                return;
            }
            
            // Ask for confirmation if not skipped
            if (!skipConfirmation) {
                const confirmed = await askConfirmation();
                if (!confirmed) {
                    console.log('❌ Operation cancelled.');
                    return;
                }
            }
            
            console.log('\n🧹 Starting database cleanup...');
            
            // Begin transaction
            await client.query('BEGIN');

            let totalDeleted = 0;

            // Prefer TRUNCATE with CASCADE and RESTART IDENTITY (no superuser needed)
            let usedTruncate = false;
            try {
                await client.query('TRUNCATE TABLE applications, jobs, users, companies RESTART IDENTITY CASCADE');
                usedTruncate = true;
                totalDeleted = totalRecords; // we don't get per-table counts from TRUNCATE
                console.log('   ✓ Truncated tables with CASCADE and reset identities');
            } catch (truncateError) {
                console.log(`   ⚠️  TRUNCATE failed (${truncateError.message}). Falling back to ordered deletes...`);

                // Fallback: ordered DELETEs honoring FKs (no need to disable triggers)
                for (const table of TABLES_TO_CLEAN) {
                    try {
                        const result = await client.query(`DELETE FROM ${table}`);
                        const deletedCount = result.rowCount;
                        totalDeleted += deletedCount;

                        if (deletedCount > 0) {
                            console.log(`   ✓ Cleaned ${table}: ${deletedCount} records deleted`);
                        } else {
                            console.log(`   • ${table}: already empty`);
                        }
                    } catch (error) {
                        console.log(`   ⚠️  ${table}: ${error.message}`);
                    }
                }

                // Reset sequences to start from 1 again
                console.log('\n🔄 Resetting auto-increment sequences...');
                const sequenceResets = [
                    'ALTER SEQUENCE users_id_seq RESTART WITH 1',
                    'ALTER SEQUENCE jobs_id_seq RESTART WITH 1', 
                    'ALTER SEQUENCE applications_id_seq RESTART WITH 1',
                    'ALTER SEQUENCE companies_id_seq RESTART WITH 1'
                ];

                for (const resetQuery of sequenceResets) {
                    try {
                        await client.query(resetQuery);
                    } catch (error) {
                        // Sequence might not exist, ignore error
                    }
                }
                console.log('   ✓ Sequences reset successfully');
            }

            // Commit transaction
            await client.query('COMMIT');
            
            console.log('\n🎉 Database cleanup completed successfully!');
            console.log(`📊 Summary: ${totalDeleted} total records deleted`);
            
            // Verify cleanup
            console.log('\n🔍 Verifying cleanup...');
            const afterCounts = await getTableCounts(client);
            let remainingRecords = 0;
            
            for (const [table, count] of Object.entries(afterCounts)) {
                console.log(`   • ${table}: ${count} records`);
                remainingRecords += count;
            }
            
            if (remainingRecords === 0) {
                console.log('✅ All data successfully removed!');
            } else {
                console.log(`⚠️  ${remainingRecords} records still remain`);
            }
            
        } catch (error) {
            // Rollback transaction on error
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
};

const showUsage = () => {
    console.log('🧹 Database Cleanup Script');
    console.log('==========================');
    console.log('');
    console.log('This script will DELETE ALL DATA from the following tables:');
    console.log('• applications');
    console.log('• jobs');
    console.log('• companies'); 
    console.log('• users');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/cleanup.js          # Interactive mode (asks for confirmation)');
    console.log('  node scripts/cleanup.js --confirm # Skip confirmation prompt');
    console.log('');
    console.log('NPM Scripts:');
    console.log('  npm run cleanup         # Interactive cleanup');
    console.log('  npm run cleanup:force   # Skip confirmation');
    console.log('');
};

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    process.exit(0);
}

// Run cleanup
showUsage();
cleanupDatabase()
    .then(() => {
        console.log('✅ Cleanup process completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Cleanup process failed:', error);
        process.exit(1);
    });
