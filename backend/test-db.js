import { pool } from './database/postgresSchemas.js';

async function testDatabase() {
  const client = await pool.connect();
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await client.query('SELECT 1 as test');
    console.log('Database connection successful:', result.rows[0]);
    
    // Check if jobs table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'jobs'
      );
    `);
    console.log('Jobs table exists:', tableCheck.rows[0].exists);
    
    // Check jobs table structure
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'jobs'
      ORDER BY ordinal_position;
    `);
    console.log('Jobs table columns:', columns.rows);
    
    // Check companies table structure
    const companyColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'companies'
      ORDER BY ordinal_position;
    `);
    console.log('Companies table columns:', companyColumns.rows);
    
  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

testDatabase();


