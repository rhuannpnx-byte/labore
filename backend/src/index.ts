import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { formRoutes } from './routes/form.routes';
import { submissionRoutes } from './routes/submission.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import companyRoutes from './routes/company.routes';
import projectRoutes from './routes/project.routes';
import reportRoutes from './routes/report.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Labore Forms API is running' });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api/health`);
});

