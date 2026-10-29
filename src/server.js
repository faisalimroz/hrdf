import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { seedSiteSettings } from './seeds/siteSettingSeed.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import childRoutes from './routes/childRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import formRoutes from './routes/formRoutes.js';
import portalRoutes from './routes/portalRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { seedChildren } from './seeds/childSeed.js';
import { seedContent } from './seeds/contentSeed.js';
import { seedSchoolBranches } from './seeds/schoolSeed.js';
import { seedAdminUser } from './seeds/adminSeed.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express application
const app = express();

// Security and HTTP headers middleware (allowing cross-origin media rendering)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Express Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP Request Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Serve uploaded media files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root entry point
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Hdfd Foundation (Human Development Forum Bangladesh) API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/children', childRoutes);
app.use('/api/blogs', contentRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', contentRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/admin', adminRoutes);

// Fallback & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

// Port Configuration
const PORT = process.env.PORT || 5000;

/**
 * Bootstrap Server and Database Connection
 */
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Auto-seed default site settings, children, content, and admin if non-existent
    await seedSiteSettings();
    await seedChildren();
    await seedContent();
    await seedSchoolBranches();
    await seedAdminUser();

    // 3. Start listening for incoming connections
    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` Hdfd Foundation Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(` Listening on port: http://localhost:${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });

    // Graceful Shutdown Handler
    const shutdown = (signal) => {
      console.log(`\n[Server] Received ${signal}. Closing HTTP server gracefully...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error(`[Server Startup Error]: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export default app;
