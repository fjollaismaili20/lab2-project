import mongoose from 'mongoose';
import Blog from '../models/blogSchema.js';

// Sample blog data
const sampleBlogs = [
  {
    title: "Welcome to Our Company Blog!",
    content: "We're excited to launch our company blog where we'll be sharing insights, updates, and stories from our team. This is a space for us to connect with our community, share our journey, and provide valuable content about our industry, company culture, and the amazing work our team is doing every day.",
    author: "Sarah Johnson",
    authorId: "1",
    coverImage: {
      filename: "welcome-blog.jpg",
      url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&crop=center"
    },
    additionalImages: [
      {
        filename: "team-meeting.jpg",
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop&crop=center"
      },
      {
        filename: "office-space.jpg",
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&crop=center"
      }
    ]
  },
  {
    title: "The Future of Remote Work: Our 2024 Strategy",
    content: "As we navigate the evolving landscape of work, we're excited to share our comprehensive remote work strategy for 2024. We've learned valuable lessons over the past few years and are implementing new policies that prioritize flexibility, collaboration, and employee well-being. Our hybrid model combines the best of both worlds, allowing our team to work from anywhere while maintaining strong connections and productivity.",
    author: "Michael Chen",
    authorId: "1",
    coverImage: {
      filename: "remote-work.jpg",
      url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=400&fit=crop&crop=center"
    },
    additionalImages: [
      {
        filename: "home-office.jpg",
        url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop&crop=center"
      },
      {
        filename: "team-video-call.jpg",
        url: "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=400&h=300&fit=crop&crop=center"
      }
    ]
  },
  {
    title: "Building a Diverse and Inclusive Workplace",
    content: "Diversity and inclusion are at the heart of everything we do. We believe that diverse teams create better products, make better decisions, and foster innovation. This year, we've implemented new hiring practices, created employee resource groups, and launched mentorship programs to ensure everyone feels valued and supported. We're proud of the progress we've made and excited about the journey ahead.",
    author: "Emily Rodriguez",
    authorId: "1",
    coverImage: {
      filename: "diversity-inclusion.jpg",
      url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=400&fit=crop&crop=center"
    },
    additionalImages: [
      {
        filename: "team-diversity.jpg",
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop&crop=center"
      }
    ]
  },
  {
    title: "Our New Office Space: A Tour of Innovation",
    content: "We're thrilled to announce the opening of our new headquarters! Our state-of-the-art office space is designed to foster creativity, collaboration, and productivity. From our open-concept work areas to our relaxation zones and cutting-edge technology labs, every space has been carefully crafted to support our team's needs. Join us for a virtual tour of our new home!",
    author: "David Kim",
    authorId: "1",
    coverImage: {
      filename: "new-office.jpg",
      url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop&crop=center"
    },
    additionalImages: [
      {
        filename: "modern-office.jpg",
        url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop&crop=center"
      },
      {
        filename: "office-lobby.jpg",
        url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&crop=center"
      }
    ]
  },
  {
    title: "Sustainability Initiatives: Our Commitment to the Planet",
    content: "As a company, we're deeply committed to environmental sustainability. This year, we've launched several initiatives including carbon-neutral operations, waste reduction programs, and partnerships with eco-friendly suppliers. We're also proud to announce that 100% of our energy now comes from renewable sources. Every small step counts, and we're excited to share our journey toward a more sustainable future.",
    author: "Lisa Thompson",
    authorId: "1",
    coverImage: {
      filename: "sustainability.jpg",
      url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop&crop=center"
    },
    additionalImages: [
      {
        filename: "green-energy.jpg",
        url: "https://images.unsplash.com/photo-1466611653911-95081537e5c7?w=400&h=300&fit=crop&crop=center"
      },
      {
        filename: "recycling.jpg",
        url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&crop=center"
      }
    ]
  },
  {
    title: "Employee Spotlight: Meet Our Rising Stars",
    content: "This month, we're shining a spotlight on some of our incredible team members who have gone above and beyond. From innovative project contributions to exceptional leadership, these individuals exemplify our company values. We're proud to have such talented and dedicated people on our team, and we can't wait to see what they'll accomplish next!",
    author: "James Wilson",
    authorId: "1",
    coverImage: {
      filename: "employee-spotlight.jpg",
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&crop=center"
    },
    additionalImages: [
      {
        filename: "team-celebration.jpg",
        url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&crop=center"
      }
    ]
  },
  {
    title: "Technology Trends: What We're Watching in 2024",
    content: "The tech landscape is constantly evolving, and we're always keeping an eye on emerging trends that could impact our industry. From artificial intelligence and machine learning to blockchain and quantum computing, we're exploring how these technologies can enhance our products and services. Our R&D team is working on exciting projects that we can't wait to share with you!",
    author: "Alex Patel",
    authorId: "1",
    coverImage: {
      filename: "tech-trends.jpg",
      url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&crop=center"
    },
    additionalImages: [
      {
        filename: "ai-technology.jpg",
        url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop&crop=center"
      },
      {
        filename: "data-analysis.jpg",
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center"
      }
    ]
  },
  {
    title: "Company Culture: The Values That Drive Us",
    content: "Our company culture is built on a foundation of core values that guide everything we do. Integrity, innovation, collaboration, and customer focus are not just words on a wall – they're principles we live by every day. We believe that a strong culture leads to better outcomes for our team, our customers, and our community. Here's how we're putting these values into action.",
    author: "Maria Garcia",
    authorId: "1",
    coverImage: {
      filename: "company-culture.jpg",
      url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=400&fit=crop&crop=center"
    },
    additionalImages: [
      {
        filename: "team-values.jpg",
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop&crop=center"
      }
    ]
  },
  {
    title: "Customer Success Stories: Making a Real Impact",
    content: "Nothing makes us happier than hearing about the positive impact our products and services have on our customers' lives. This quarter, we've received incredible feedback from clients who have transformed their businesses with our solutions. From small startups to large enterprises, we're proud to be part of their success stories. These testimonials remind us why we do what we do.",
    author: "Robert Taylor",
    authorId: "1",
    coverImage: {
      filename: "customer-success.jpg",
      url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop&crop=center"
    },
    additionalImages: [
      {
        filename: "happy-customers.jpg",
        url: "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400&h=300&fit=crop&crop=center"
      },
      {
        filename: "business-growth.jpg",
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=center"
      }
    ]
  },
  {
    title: "Looking Ahead: Our Vision for the Next Decade",
    content: "As we reflect on our journey so far, we're excited about the future and the opportunities that lie ahead. Our vision for the next decade includes expanding into new markets, developing breakthrough technologies, and continuing to build a world-class team. We're committed to innovation, growth, and making a positive impact on the world. The best is yet to come!",
    author: "Jennifer Lee",
    authorId: "1",
    coverImage: {
      filename: "future-vision.jpg",
      url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop&crop=center"
    },
    additionalImages: [
      {
        filename: "future-technology.jpg",
        url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop&crop=center"
      },
      {
        filename: "growth-chart.jpg",
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center"
      }
    ]
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job_blog');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Generate sample blogs
const generateSampleBlogs = async () => {
  try {
    await connectDB();
    
    // Clear existing blogs
    await Blog.deleteMany({});
    console.log('Cleared existing blogs');
    
    // Insert sample blogs
    const createdBlogs = await Blog.insertMany(sampleBlogs);
    console.log(`Successfully created ${createdBlogs.length} sample blogs`);
    
    // Display created blogs
    createdBlogs.forEach((blog, index) => {
      console.log(`${index + 1}. ${blog.title} - by ${blog.author}`);
    });
    
    console.log('\nSample blogs generated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error generating sample blogs:', error);
    process.exit(1);
  }
};

// Run the script
generateSampleBlogs();
