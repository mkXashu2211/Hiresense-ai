import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import analysisRoutes from './routes/analysis.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, limit: 150 }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'HireSense AI' }));
app.use('/api/auth', authRoutes);
app.use('/api/analyses', analysisRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(port, () => console.log(`API running on ${port}`)))
  .catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
