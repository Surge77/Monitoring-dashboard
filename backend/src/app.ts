import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import metricsRoutes from './routes/metrics.routes';
import alertsRoutes from './routes/alerts.routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/metrics', metricsRoutes);
app.use('/alerts', alertsRoutes);

app.use(errorMiddleware);

export default app;
