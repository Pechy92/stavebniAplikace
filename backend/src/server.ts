import express from 'express';
import cors from 'cors';
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
import { createTables } from './config/initDatabase';
import { addWorkerInstructions } from './migrations/add-worker-instructions';

dotenv.config();

// Spustit migrace při startu
addWorkerInstructions().catch(console.error);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Inicializace databáze a spuštění serveru
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
