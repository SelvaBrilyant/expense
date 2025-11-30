import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Import routes AFTER environment variables are loaded
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import budgetRoutes from './routes/budgetRoutes';
import aiRoutes from './routes/aiRoutes';
import uploadRoutes from './routes/uploadRoutes';
import savingsRoutes from './routes/savingsRoutes';
import { initCronJobs } from './services/cronService';
import { notFound, errorHandler } from './middlewares/errorMiddleware';

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/users', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/savings', savingsRoutes);

// Swagger Documentation
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Init Cron Jobs
initCronJobs();

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});