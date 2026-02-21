import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config(); // Must be called very first before anything imports utils/whatsapp!

import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';
import { startCronJobs } from './utils/cronJobs';

const startServer = async () => {
    await connectDB();

    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/users', userRoutes);

    const PORT = process.env.PORT || 5000;

    // Initializing the scheduler ONLY after successful port binding
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        startCronJobs();
    });

    server.on('error', (e: any) => {
        if (e.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is busy. This process will exit to prevent duplicate cron jobs.`);
            process.exit(1);
        }
    });
};

startServer();
