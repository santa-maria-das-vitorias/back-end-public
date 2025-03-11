"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const apicache_1 = __importDefault(require("apicache"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const net_1 = __importDefault(require("net"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
// Rotas
const client_1 = require("@prisma/client");
const categories_1 = __importDefault(require("./routes/categories"));
const articles_1 = __importDefault(require("./routes/articles"));
const stats_1 = __importDefault(require("./routes/stats"));
const auth_1 = require("./middleware/auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
// API Key authentication middleware for all API routes
const origin = process.env.DEVELOPMENT === 'false'
    ? process.env.PROD_FRONT_URL
    : process.env.DEV_FRONT_URL;
app.use((0, cors_1.default)({
    origin: origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-API-Key', 'x-api-key', 'Authorization'],
    exposedHeaders: ['X-API-Key'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
const cache = apicache_1.default.middleware;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Muitas requisições criadas a partir deste IP, por favor tente novamente após 15 minutos',
});
// Serve static files from the 'public' directory
app.use(express_1.default.static('public'));
app.use(express_1.default.json());
app.use(limiter);
app.use(cache('1 hour'));
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use('/api', auth_1.apiKeyAuth);
// Root route to serve index.html
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: './public' });
});
// Rotas
app.use('/api/categories', categories_1.default);
app.use('/api/articles', articles_1.default);
app.use('/api/stats', stats_1.default);
// Check if port is available before starting
const isPortAvailable = (port) => {
    return new Promise((resolve) => {
        const server = net_1.default.createServer();
        server.once('error', (err) => {
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
if (cluster_1.default.isPrimary) {
    if (isDevelopment) {
        console.log('Development mode: Running with a single process');
        cluster_1.default.fork();
    }
    else {
        // Production mode: Use multiple workers
        const numCPUs = os_1.default.cpus().length;
        console.log(`Production mode: Forking ${numCPUs} workers`);
        for (let i = 0; i < numCPUs; i++) {
            cluster_1.default.fork();
        }
    }
    cluster_1.default.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
        // Don't restart for specific error conditions
        if (code === 1) {
            console.log('Worker exited with error code 1, likely due to port in use. Not restarting.');
        }
        else {
            console.log('Restarting worker...');
            cluster_1.default.fork();
        }
    });
}
else {
    // Worker process
    startServer();
}
