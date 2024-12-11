import express from 'express';
import cors from 'cors';
import { adminRoutes } from './routes/admin';
import { metricsRoutes } from './routes/metrics';
import { authMiddleware } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Admin routes with authentication
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/metrics', authMiddleware, metricsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});