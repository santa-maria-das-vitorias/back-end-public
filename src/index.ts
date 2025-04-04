import express from 'express';
import rateLimit from 'express-rate-limit';
import apicache from 'apicache';
import helmet from 'helmet';
import compression from 'compression';
import cluster from 'cluster';
import os from 'os';
import net from 'net';
import dotenv from 'dotenv';
import cors from 'cors';

// Rotas
import { PrismaClient } from '@prisma/client';
import categoryRoutes from './routes/categories';
import articleRoutes from './routes/articles';
import statsRoutes from './routes/stats';
import { apiKeyAuth } from './middleware/auth';

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Configuração de CORS
const origin = process.env.DEVELOPMENT === 'false'
  ? process.env.PROD_FRONT_URL
  : process.env.DEV_FRONT_URL;

app.use(cors({
  origin: origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key', 'x-api-key', 'Authorization'],
  exposedHeaders: ['X-API-Key'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Middleware
const cache = apicache.middleware;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições criadas a partir deste IP, por favor tente novamente após 15 minutos',
});

// Serve static files from the 'public' directory
app.use(express.json());
app.use(limiter);
app.use(cache('1 hour'));
app.use(helmet());
app.use(compression());

app.use('/api', apiKeyAuth);

// Rotas
app.use('/api/categories', categoryRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/stats', statsRoutes);

// Check if port is available before starting
const isPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      }
      resolve(false);
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
};

// Start the server function
const startServer = async () => {
  // Check if port is available
  const portAvailable = await isPortAvailable(PORT);
  
  if (!portAvailable) {
    console.error(`Port ${PORT} is already in use. Please choose a different port or close the application using it.`);
    process.exit(1);
  }
  
  // Only then start the server
  app.listen(PORT, async () => {
    console.log(`Servidor rodando em http://localhost:${PORT} (Worker ${process.pid})`);
  });
};

// Only use clustering in production environment
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

if (cluster.isPrimary) {
  if (isDevelopment) {
    console.log('Development mode: Running with a single process');
    cluster.fork();
  } else {
    // Production mode: Use multiple workers
    const numCPUs = os.cpus().length;
    console.log(`Production mode: Forking ${numCPUs} workers`);
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
    
    // Don't restart for specific error conditions
    if (code === 1) {
      console.log('Worker exited with error code 1, likely due to port in use. Not restarting.');
    } else {
      console.log('Restarting worker...');
      cluster.fork();
    }
  });
} else {
  // Worker process
  startServer();
}
