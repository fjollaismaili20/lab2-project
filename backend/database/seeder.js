// Database Seeder with Realistic Data
import { pool } from './postgresSchemas.js';
import bcrypt from 'bcrypt';

// Check if database has data
export const isDatabaseEmpty = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT COUNT(*) FROM users');
        client.release();
        return parseInt(result.rows[0].count) === 0;
    } catch (error) {
        console.error('Error checking database status:', error);
        return false;
    }
};

// Seed data
const seedData = {
    users: [
        {
            name: 'Alice Johnson',
            email: 'alice.johnson@email.com',
            phone: 1234567890,
            password: 'password123',
            role: 'Job Seeker'
        },
        {
            name: 'Bob Smith',
            email: 'bob.smith@email.com',
            phone: 2345678901,
            password: 'password123',
            role: 'Employer'
        },
        {
            name: 'Carol Davis',
            email: 'carol.davis@email.com',
            phone: 3456789012,
            password: 'password123',
            role: 'Job Seeker'
        },
        {
            name: 'David Wilson',
            email: 'david.wilson@email.com',
            phone: 4567890123,
            password: 'password123',
            role: 'Employer'
        },
        {
            name: 'Emma Brown',
            email: 'emma.brown@email.com',
            phone: 5678901234,
            password: 'password123',
            role: 'Job Seeker'
        },
        {
            name: 'Frank Miller',
            email: 'frank.miller@email.com',
            phone: 6789012345,
            password: 'password123',
            role: 'Employer'
        },
        {
            name: 'Grace Taylor',
            email: 'grace.taylor@email.com',
            phone: 7890123456,
            password: 'password123',
            role: 'Job Seeker'
        }
    ],
    companies: [
        {
            company_id: 'TECH001',
            company_name: 'TechCorp Solutions',
            address: '123 Silicon Valley, San Francisco, CA 94105',
            description: 'Leading technology solutions provider specializing in cloud computing, AI, and software development. We help businesses transform digitally with cutting-edge technologies.'
        },
        {
            company_id: 'MED002',
            company_name: 'HealthCare Plus',
            address: '456 Medical Center Dr, Boston, MA 02115',
            description: 'Comprehensive healthcare services provider with state-of-the-art facilities and experienced medical professionals dedicated to patient care excellence.'
        },
        {
            company_id: 'FIN003',
            company_name: 'Global Finance Corp',
            address: '789 Wall Street, New York, NY 10005',
            description: 'International financial services company offering investment banking, wealth management, and corporate finance solutions to clients worldwide.'
        },
        {
            company_id: 'EDU004',
            company_name: 'EduTech Innovations',
            address: '321 Learning Ave, Austin, TX 73301',
            description: 'Educational technology company developing innovative learning platforms and digital educational tools for schools and universities.'
        },
        {
            company_id: 'RET005',
            company_name: 'RetailMax Group',
            address: '654 Commerce Blvd, Chicago, IL 60601',
            description: 'Leading retail chain with over 500 stores nationwide, offering quality products and exceptional customer service across multiple categories.'
        }
    ],
    jobs: [
        {
            title: 'Senior Software Engineer',
            description: 'We are looking for a Senior Software Engineer to join our dynamic development team. You will be responsible for designing, developing, and maintaining scalable web applications using modern technologies. Experience with React, Node.js, and cloud platforms is required.',
            category: 'Information Technology',
            country: 'United States',
            city: 'San Francisco',
            location: '123 Silicon Valley, San Francisco, CA 94105 - Remote work options available',
            fixed_salary: 120000,
            salary_from: null,
            salary_to: null
        },
        {
            title: 'Marketing Manager',
            description: 'Join our marketing team as a Marketing Manager to develop and execute comprehensive marketing strategies. You will lead campaigns, analyze market trends, and collaborate with cross-functional teams to drive brand awareness and customer acquisition.',
            category: 'Marketing',
            country: 'United States',
            city: 'New York',
            location: '789 Wall Street, New York, NY 10005 - Hybrid work model',
            salary_from: 80000,
            salary_to: 100000,
            fixed_salary: null
        },
        {
            title: 'Data Analyst',
            description: 'We are seeking a detail-oriented Data Analyst to join our analytics team. You will analyze large datasets, create insightful reports, and provide data-driven recommendations to support business decisions. Proficiency in SQL, Python, and data visualization tools required.',
            category: 'Data Science',
            country: 'United States',
            city: 'Austin',
            location: '321 Learning Ave, Austin, TX 73301 - On-site position',
            fixed_salary: 75000,
            salary_from: null,
            salary_to: null,
        },
        {
            title: 'UX/UI Designer',
            description: 'Creative UX/UI Designer needed to design intuitive and engaging user interfaces for our web and mobile applications. You will conduct user research, create wireframes and prototypes, and collaborate with development teams to deliver exceptional user experiences.',
            category: 'Design',
            country: 'United States',
            city: 'San Francisco',
            location: '123 Silicon Valley, San Francisco, CA 94105 - Flexible work arrangements',
            salary_from: 85000,
            salary_to: 110000,
            fixed_salary: null,
        },
        {
            title: 'Financial Analyst',
            description: 'Join our finance team as a Financial Analyst to support financial planning, budgeting, and analysis activities. You will prepare financial reports, conduct variance analysis, and assist in strategic decision-making processes.',
            category: 'Finance',
            country: 'United States',
            city: 'New York',
            location: '789 Wall Street, New York, NY 10005 - Office-based role',
            fixed_salary: 70000,
            salary_from: null,
            salary_to: null,
        },
        {
            title: 'Customer Success Manager',
            description: 'We are looking for a Customer Success Manager to build strong relationships with our clients and ensure their success with our products. You will onboard new customers, provide ongoing support, and identify opportunities for account growth.',
            category: 'Customer Service',
            country: 'United States',
            city: 'Chicago',
            location: '654 Commerce Blvd, Chicago, IL 60601 - Hybrid work model',
            salary_from: 60000,
            salary_to: 80000,
            fixed_salary: null,
        }
    ],
    applications: [
        {
            cover_letter: 'I am excited to apply for the Senior Software Engineer position. With 5+ years of experience in full-stack development and expertise in React and Node.js, I am confident I can contribute significantly to your development team. I have successfully led multiple projects and have a passion for creating scalable, efficient solutions.',
            phone: 1234567890,
            address: '123 Main St, San Francisco, CA 94102',
            resume_public_id: 'resume_alice_001',
            resume_url: 'https://cloudinary.com/resumes/alice_johnson_resume.pdf'
        },
        {
            cover_letter: 'I am writing to express my interest in the Marketing Manager position. With my background in digital marketing and campaign management, along with my analytical skills and creative approach, I believe I would be a valuable addition to your marketing team. I have successfully increased brand awareness by 150% in my previous role.',
            phone: 3456789012,
            address: '456 Oak Ave, New York, NY 10001',
            resume_public_id: 'resume_carol_002',
            resume_url: 'https://cloudinary.com/resumes/carol_davis_resume.pdf'
        },
        {
            cover_letter: 'I am passionate about data analysis and would love to join your analytics team. My experience with SQL, Python, and Tableau, combined with my ability to translate complex data into actionable insights, makes me an ideal candidate for the Data Analyst position. I have worked on projects involving customer segmentation and predictive modeling.',
            phone: 5678901234,
            address: '789 Pine St, Austin, TX 73301',
            resume_public_id: 'resume_emma_003',
            resume_url: 'https://cloudinary.com/resumes/emma_brown_resume.pdf'
        },
        {
            cover_letter: 'As a creative professional with a strong background in user experience design, I am excited about the UX/UI Designer opportunity. My portfolio demonstrates my ability to create user-centered designs that are both beautiful and functional. I have experience with design thinking methodologies and user research techniques.',
            phone: 7890123456,
            address: '321 Elm St, San Francisco, CA 94103',
            resume_public_id: 'resume_grace_004',
            resume_url: 'https://cloudinary.com/resumes/grace_taylor_resume.pdf'
        }
    ]
};

// Seed functions
const seedUsers = async (client) => {
    console.log('Seeding users...');
    const insertedUsers = [];
    
    for (const user of seedData.users) {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        const result = await client.query(
            'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user.name, user.email, user.phone, hashedPassword, user.role]
        );
        insertedUsers.push(result.rows[0]);
    }
    
    console.log(`✓ Seeded ${insertedUsers.length} users`);
    return insertedUsers;
};

const seedCompanies = async (client) => {
    console.log('Seeding companies...');
    const insertedCompanies = [];
    
    for (const company of seedData.companies) {
        const result = await client.query(
            'INSERT INTO companies (company_id, company_name, address, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [company.company_id, company.company_name, company.address, company.description]
        );
        insertedCompanies.push(result.rows[0]);
    }
    
    console.log(`✓ Seeded ${insertedCompanies.length} companies`);
    return insertedCompanies;
};

const seedJobs = async (client, insertedUsers) => {
    console.log('Seeding jobs...');
    const insertedJobs = [];
    
    // Get employers from inserted users
    const employers = insertedUsers.filter(user => user.role === 'Employer');
    
    for (let i = 0; i < seedData.jobs.length; i++) {
        const job = seedData.jobs[i];
        // Use actual employer IDs, cycling through available employers
        const employerId = employers[i % employers.length].id;
        
        const result = await client.query(
            'INSERT INTO jobs (title, description, category, country, city, location, fixed_salary, salary_from, salary_to, posted_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [job.title, job.description, job.category, job.country, job.city, job.location, job.fixed_salary, job.salary_from, job.salary_to, employerId]
        );
        insertedJobs.push(result.rows[0]);
    }
    
    console.log(`✓ Seeded ${insertedJobs.length} jobs`);
    return insertedJobs;
};

const seedApplications = async (client, insertedUsers, insertedJobs) => {
    console.log('Seeding applications...');
    const insertedApplications = [];
    
    // Get job seekers and employers from inserted users
    const jobSeekers = insertedUsers.filter(user => user.role === 'Job Seeker');
    const employers = insertedUsers.filter(user => user.role === 'Employer');
    
    for (let i = 0; i < seedData.applications.length; i++) {
        const application = seedData.applications[i];
        
        // Use actual IDs from inserted data
        const applicant = jobSeekers[i % jobSeekers.length];
        const job = insertedJobs[i % insertedJobs.length];
        const employer = employers.find(emp => emp.id === job.posted_by);
        
        const result = await client.query(
            'INSERT INTO applications (name, email, cover_letter, phone, address, resume_public_id, resume_url, applicant_id, employer_id, job_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [applicant.name, applicant.email, application.cover_letter, application.phone, application.address, application.resume_public_id, application.resume_url, applicant.id, employer.id, job.id]
        );
        insertedApplications.push(result.rows[0]);
    }
    
    console.log(`✓ Seeded ${insertedApplications.length} applications`);
    return insertedApplications;
};

// Main seeder function
export const seedDatabase = async () => {
    try {
        const isEmpty = await isDatabaseEmpty();
        
        if (!isEmpty) {
            console.log('Database already contains data. Skipping seeding.');
            return;
        }
        
        console.log('🌱 Starting database seeding...');
        const client = await pool.connect();
        
        try {
            // Begin transaction
            await client.query('BEGIN');
            
            // Seed data in order (respecting foreign key dependencies)
            const insertedUsers = await seedUsers(client);
            const insertedCompanies = await seedCompanies(client);
            const insertedJobs = await seedJobs(client, insertedUsers);
            const insertedApplications = await seedApplications(client, insertedUsers, insertedJobs);
            
            // Commit transaction
            await client.query('COMMIT');
            
            console.log('🎉 Database seeding completed successfully!');
            console.log('📊 Seeded data summary:');
            console.log(`   • ${seedData.users.length} users (mix of job seekers and employers)`);
            console.log(`   • ${seedData.companies.length} companies`);
            console.log(`   • ${seedData.jobs.length} job postings`);
            console.log(`   • ${seedData.applications.length} job applications`);
            
        } catch (error) {
            // Rollback transaction on error
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
};

// Export seed data for testing purposes
export { seedData };
