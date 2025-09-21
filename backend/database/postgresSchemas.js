// PostgreSQL Database Schemas and Queries
import pkg from 'pg'
const { Pool } = pkg

// Create connection pool
const pool = new Pool({
    host: "localhost",
    user: "root",
    password: "fjola123",
    database: "job",
    port: 5432
})

// User Schema Queries
export const userQueries = {
    create: `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(30) NOT NULL CHECK (LENGTH(name) >= 3 AND LENGTH(name) <= 30),
            email VARCHAR(255) UNIQUE NOT NULL,
            phone BIGINT NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL CHECK (role IN ('Job Seeker', 'Employer')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `,
    insert: `
        INSERT INTO users (name, email, phone, password, role) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *
    `,
    findByEmail: `SELECT * FROM users WHERE email = $1`,
    findById: `SELECT * FROM users WHERE id = $1`,
    update: `UPDATE users SET name = $1, email = $2, phone = $3, password = $4, role = $5 WHERE id = $6 RETURNING *`,
    delete: `DELETE FROM users WHERE id = $1`
}

// Job Schema Queries
export const jobQueries = {
    create: `
        CREATE TABLE IF NOT EXISTS jobs (
            id SERIAL PRIMARY KEY,
            title VARCHAR(30) NOT NULL CHECK (LENGTH(title) >= 3 AND LENGTH(title) <= 30),
            description TEXT NOT NULL CHECK (LENGTH(description) >= 30 AND LENGTH(description) <= 500),
            category VARCHAR(100) NOT NULL,
            country VARCHAR(100) NOT NULL,
            city VARCHAR(100) NOT NULL,
            location TEXT NOT NULL CHECK (LENGTH(location) >= 20),
            fixed_salary INTEGER CHECK (fixed_salary >= 1000 AND fixed_salary <= 999999999),
            salary_from INTEGER CHECK (salary_from >= 1000 AND salary_from <= 999999999),
            salary_to INTEGER CHECK (salary_to >= 1000 AND salary_to <= 999999999),
            expired BOOLEAN DEFAULT FALSE,
            job_posted_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            posted_by INTEGER REFERENCES users(id) ON DELETE CASCADE
        )
    `,
    insert: `
        INSERT INTO jobs (title, description, category, country, city, location, fixed_salary, salary_from, salary_to, posted_by) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING *
    `,
    findAll: `SELECT * FROM jobs WHERE expired = FALSE ORDER BY job_posted_on DESC`,
    findById: `SELECT * FROM jobs WHERE id = $1`,
    findByUserId: `SELECT * FROM jobs WHERE posted_by = $1 ORDER BY job_posted_on DESC`,
    update: `UPDATE jobs SET title = $1, description = $2, category = $3, country = $4, city = $5, location = $6, fixed_salary = $7, salary_from = $8, salary_to = $9, expired = $10 WHERE id = $11 RETURNING *`,
    delete: `DELETE FROM jobs WHERE id = $1`
}

// Application Schema Queries
export const applicationQueries = {
    create: `
        CREATE TABLE IF NOT EXISTS applications (
            id SERIAL PRIMARY KEY,
            name VARCHAR(30) NOT NULL CHECK (LENGTH(name) >= 3 AND LENGTH(name) <= 30),
            email VARCHAR(255) NOT NULL,
            cover_letter TEXT NOT NULL,
            phone BIGINT NOT NULL,
            address TEXT NOT NULL,
            resume_public_id VARCHAR(255) NOT NULL,
            resume_url VARCHAR(500) NOT NULL,
            applicant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            employer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `,
    insert: `
        INSERT INTO applications (name, email, cover_letter, phone, address, resume_public_id, resume_url, applicant_id, employer_id, job_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING *
    `,
    findByEmployerId: `
        SELECT a.*, j.title as job_title, u.name as applicant_name 
        FROM applications a 
        JOIN jobs j ON a.job_id = j.id 
        JOIN users u ON a.applicant_id = u.id 
        WHERE a.employer_id = $1 
        ORDER BY a.created_at DESC
    `,
    findByApplicantId: `
        SELECT a.*, j.title as job_title, u.name as employer_name 
        FROM applications a 
        JOIN jobs j ON a.job_id = j.id 
        JOIN users u ON a.employer_id = u.id 
        WHERE a.applicant_id = $1 
        ORDER BY a.created_at DESC
    `,
    findById: `SELECT * FROM applications WHERE id = $1`,
    delete: `DELETE FROM applications WHERE id = $1`
}

// Company Schema Queries
export const companyQueries = {
    create: `
        CREATE TABLE IF NOT EXISTS companies (
            id SERIAL PRIMARY KEY,
            company_id VARCHAR(50) UNIQUE,
            company_name VARCHAR(255) NOT NULL,
            address TEXT,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `,
    insert: `
        INSERT INTO companies (company_id, company_name, address, description) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
    `,
    findAll: `SELECT * FROM companies ORDER BY created_at DESC`,
    findById: `SELECT * FROM companies WHERE id = $1`,
    update: `UPDATE companies SET company_id = $1, company_name = $2, address = $3, description = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *`,
    delete: `DELETE FROM companies WHERE id = $1`
}

// Database initialization function
export const initializeDatabase = async () => {
    try {
        const client = await pool.connect()
        
        // Create tables in order (respecting foreign key dependencies)
        await client.query(userQueries.create)
        await client.query(jobQueries.create)
        await client.query(applicationQueries.create)
        await client.query(companyQueries.create)
        
        console.log('PostgreSQL database tables created successfully')
        client.release()
    } catch (error) {
        console.error('Error initializing PostgreSQL database:', error)
        throw error
    }
}

// Export pool for use in controllers
export { pool }
