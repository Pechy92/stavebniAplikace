import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import extraWorkRoutes from './routes/extraWorkRoutes';
import materialRoutes from './routes/materialRoutes';
import userRoutes from './routes/userRoutes';
import shiftRoutes from './routes/shiftRoutes';
import notificationRoutes from './routes/notificationRoutes';
import initRoutes from './routes/initRoutes';
import migrateRoutes from './routes/migrateRoutes';
import translateRoutes from './routes/translateRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './middleware/errorHandler';
import { globalLimiter } from './middleware/rateLimiters';
import { createTables } from './config/initDatabase';
import { addWorkerInstructions } from './migrations/add-worker-instructions';
import { addCloudinaryColumns } from './migrations/add-cloudinary-columns';
import { addMaterialProjectIdColumn } from './migrations/add-material-project-id';

dotenv.config();

// Spustit migrace při startu
addWorkerInstructions().catch(console.error);
addCloudinaryColumns().catch(console.error);
addMaterialProjectIdColumn().catch(console.error);

const app = express();
const PORT = process.env.PORT || 3001;

// Security: Helmet - základní bezpečnostní headery
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://api.cloudinary.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Security: Rate Limiting - globální ochrana
app.use('/api/', globalLimiter);

// Security: CORS - omezená konfigurace
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.FRONTEND_URL || 'https://stavby.cmpe.cz').split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Povolit requesty bez origin (např. mobilní aplikace, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => allowed.trim() === origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hodin cache pro preflight requesty
}));

app.use(express.json({ limit: '10mb' })); // Limit velikosti JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Statické soubory pro uploady
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/extra-work', extraWorkRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', initRoutes);
app.use('/api', migrateRoutes);
app.use('/api', translateRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server běží' });
});

// Error handler
app.use(errorHandler);

// Inicializace databáze a spuštění serveru - Force redeploy
async function startServer() {
  try {
    await createTables();
    console.log('✅ Databáze inicializována');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server běží na http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Chyba při spuštění serveru:', error);
    process.exit(1);
  }
}

startServer();

export default app;
// Force redeploy 1773155462
