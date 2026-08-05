import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    console.log('[Seed] Cleared existing collections...');

    // 1. Create Default Demo User
    const user = await User.create({
      name: 'Nguyen Thanh Nam',
      email: 'nam.nguyen@ptit.edu.vn',
      password: 'password123',
      role: 'user',
    });
    console.log(`[Seed] Created User: ${user.name} (${user.email})`);

    // 2. Create Diverse Realistic Projects
    const project1 = await Project.create({
      name: 'E-Commerce Microservices Platform',
      description: 'Distributed shopping architecture with Express, MongoDB, and React client.',
      color: '#2563eb',
      user: user._id,
    });

    const project2 = await Project.create({
      name: 'AI Customer Support Portal',
      description: 'Intelligent ticket routing system with automated sentiment analysis and response triage.',
      color: '#7c3aed',
      user: user._id,
    });

    const project3 = await Project.create({
      name: 'DevOps CI/CD Automation Pipeline',
      description: 'Infrastructure containerization, automated testing workflows, and Kubernetes deployment.',
      color: '#059669',
      user: user._id,
    });

    const project4 = await Project.create({
      name: 'Mobile Banking Application V2',
      description: 'Biometric authentication, real-time transaction tracking, and monthly expense analytics.',
      color: '#d97706',
      user: user._id,
    });
    console.log('[Seed] Created 4 sample projects...');

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // 3. Create Diverse Tasks for Project 1 (E-Commerce Platform)
    await Task.create([
      {
        title: 'Design RESTful Auth & JWT Middleware',
        description: 'Implement token verification, bcrypt hashing, and role-based access control guards.',
        status: 'done',
        priority: 'high',
        dueDate: new Date(now - 2 * oneDay),
        dueTime: '09:30',
        project: project1._id,
        user: user._id,
      },
      {
        title: 'Implement Product Catalog & Pagination API',
        description: 'Support multi-filter search, category indexing, and efficient cursor-based queries.',
        status: 'done',
        priority: 'medium',
        dueDate: new Date(now - 1 * oneDay),
        dueTime: '14:00',
        project: project1._id,
        user: user._id,
      },
      {
        title: 'Build Native HTML5 Drag-and-Drop Kanban Board',
        description: 'Smooth column movement, drop-outside-to-trash interaction, and responsive layout.',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(now + 1 * oneDay),
        dueTime: '16:45',
        project: project1._id,
        user: user._id,
      },
      {
        title: 'Integrate Stripe Webhook Payment Gateway',
        description: 'Handle payment intent confirmation, idempotency keys, and transaction receipt dispatch.',
        status: 'in_progress',
        priority: 'medium',
        dueDate: new Date(now + 3 * oneDay),
        dueTime: '11:15',
        project: project1._id,
        user: user._id,
      },
      {
        title: 'Setup Unit & Integration Tests with Jest',
        description: 'Target 80%+ test coverage across controller endpoints, models, and error middleware.',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(now + 4 * oneDay),
        dueTime: '18:00',
        project: project1._id,
        user: user._id,
      },
      {
        title: 'Optimize MongoDB Aggregation Pipelines',
        description: 'Refactor complex inventory lookups and add compound indexes for fast reporting.',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(now + 6 * oneDay),
        dueTime: '10:00',
        project: project1._id,
        user: user._id,
      },
      {
        title: 'Audit System for Web Accessibility (WCAG 2.1)',
        description: 'Verify keyboard navigation, contrast ratios, and aria-labels on interactive elements.',
        status: 'todo',
        priority: 'low',
        dueDate: new Date(now + 9 * oneDay),
        dueTime: '',
        project: project1._id,
        user: user._id,
      },
      // Seed Trashed Tasks for testing the Trash feature (retained for 30 days)
      {
        title: 'Legacy Session-Based Cookie Middleware',
        description: 'Deprecated in favor of stateless JWT bearer authorization tokens.',
        status: 'done',
        priority: 'low',
        dueDate: new Date(now - 10 * oneDay),
        dueTime: '12:00',
        project: project1._id,
        user: user._id,
        isDeleted: true,
        deletedAt: new Date(now - 3 * oneDay), // Trashed 3 days ago -> 27 days left
      },
      {
        title: 'Old XML Export Endpoint for Invoices',
        description: 'Removed following client migration to JSON payloads and automated PDF generation.',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(now - 5 * oneDay),
        dueTime: '',
        project: project1._id,
        user: user._id,
        isDeleted: true,
        deletedAt: new Date(now - 5 * oneDay), // Trashed 5 days ago -> 25 days left
      },
    ]);

    // 4. Tasks for Project 2 (AI Customer Support Portal)
    await Task.create([
      {
        title: 'Connect LLM Model API & Stream Responses',
        description: 'Implement Server-Sent Events (SSE) streaming for real-time AI suggestions.',
        status: 'done',
        priority: 'high',
        dueDate: new Date(now - 3 * oneDay),
        dueTime: '10:00',
        project: project2._id,
        user: user._id,
      },
      {
        title: 'Build Sentiment Analysis Classifier',
        description: 'Flag frustrated customers for priority human agent intervention.',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(now + 2 * oneDay),
        dueTime: '15:30',
        project: project2._id,
        user: user._id,
      },
      {
        title: 'Design Ticket Escalation Rules & Email Alerts',
        description: 'Trigger notifications when an issue remains unresolved for over 2 hours.',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(now + 5 * oneDay),
        dueTime: '09:00',
        project: project2._id,
        user: user._id,
      },
      {
        title: 'Clean Up FAQ Knowledge Base Embeddings',
        description: 'Re-index vector database with updated Q&A documentation articles.',
        status: 'todo',
        priority: 'low',
        dueDate: new Date(now + 7 * oneDay),
        dueTime: '',
        project: project2._id,
        user: user._id,
      },
    ]);

    // 5. Tasks for Project 3 (DevOps CI/CD Automation Pipeline)
    await Task.create([
      {
        title: 'Dockerize Backend & Frontend Applications',
        description: 'Create multi-stage Dockerfiles with minimal production image footprint.',
        status: 'done',
        priority: 'high',
        dueDate: new Date(now - 4 * oneDay),
        dueTime: '17:00',
        project: project3._id,
        user: user._id,
      },
      {
        title: 'Configure GitHub Actions CI Workflow',
        description: 'Automate linting, unit testing, and Docker build on pull request events.',
        status: 'in_progress',
        priority: 'medium',
        dueDate: new Date(now + 1 * oneDay),
        dueTime: '13:00',
        project: project3._id,
        user: user._id,
      },
      {
        title: 'Setup Prometheus & Grafana Monitoring',
        description: 'Track request latencies, error rates, and memory utilization.',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(now + 8 * oneDay),
        dueTime: '16:00',
        project: project3._id,
        user: user._id,
      },
    ]);

    // 6. Tasks for Project 4 (Mobile Banking V2)
    await Task.create([
      {
        title: 'Biometric FaceID & Fingerprint Authentication Flow',
        description: 'Integrate secure hardware keystore with token-based session refresh.',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(now + 2 * oneDay),
        dueTime: '10:30',
        project: project4._id,
        user: user._id,
      },
      {
        title: 'Monthly Spending Breakdown Analytics Chart',
        description: 'Categorize expenses into food, utilities, savings, and investments.',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(now + 6 * oneDay),
        dueTime: '14:00',
        project: project4._id,
        user: user._id,
      },
      {
        title: 'International Wire Transfer Fee Calculator',
        description: 'Live currency exchange rate conversion with transparent transfer fees.',
        status: 'todo',
        priority: 'low',
        dueDate: new Date(now + 12 * oneDay),
        dueTime: '',
        project: project4._id,
        user: user._id,
      },
    ]);

    console.log('[Seed] Database sample data initialized successfully.');
    console.log('[Seed] Demo Credentials: nam.nguyen@ptit.edu.vn / password123');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
