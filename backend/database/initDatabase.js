// Database initialization script
import { initializeDatabase } from './postgresSchemas.js';
import { postgresConnection } from './postgresdb.js';
import { connectMongoDB } from './mongodb.js';
import { seedDatabase } from './seeder.js';

export const initDatabases = async () => {
  try {
    // Initialize PostgreSQL connection and create tables
    console.log('Initializing PostgreSQL database...');
    await postgresConnection();
    await initializeDatabase();
    console.log('PostgreSQL database initialized successfully');
    
    // Seed database with initial data if empty
    await seedDatabase();
    
    // Initialize MongoDB connection for blog functionality (optional)
    console.log('Initializing MongoDB database...');
    try {
      await connectMongoDB();
      console.log('MongoDB database initialized successfully');
    } catch (error) {
      console.warn('MongoDB connection failed - blog functionality will not be available:', error.message);
    }
    
    console.log('All databases initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};
