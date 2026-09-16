import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { ExportSession } from './models/Record.js';
import connectDB from './db.js';

import cookieParser from 'cookie-parser';
import { requireAuth } from './middleware/auth.js';
import authRoutes from './routes/auth.js';

const app = express();
// Enable credentials for CORS so cookies are sent
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increased limit to support large arrays of records
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().catch(console.error);

// --- API Routes ---

app.use('/api/auth', authRoutes);

// 1. Healthcheck
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok', 
    message: 'Backend is running',
    database: dbStatus 
  });
});

// 2. Save new Export Session & Records (PROTECTED)
app.post('/api/export-sessions', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const { filename, stats, records } = req.body;

    if (!filename || !stats || !records) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // --- STRICT TELUGU LANGUAGE VALIDATION ---
    const foreignLetterRegex = /(?=[^\u0C00-\u0C7F])\p{L}/u;
    for (const record of records) {
      const term = record.term || '';
      const meaning = record.meaning || '';
      
      if ((term && foreignLetterRegex.test(term)) || (meaning && foreignLetterRegex.test(meaning))) {
        return res.status(400).json({ error: 'TeluguMitra is built for Telugu — please upload a Telugu Excel file to keep your data clean and accurate.' });
      }
    }

    const newSession = new ExportSession({
      userId: req.user._id,
      filename,
      originalRecords: stats.originalRecords,
      duplicatesRemoved: stats.duplicatesRemoved,
      finalCleanRecords: stats.finalCleanRecords,
      records: records, 
    });

    const savedSession = await newSession.save();
    res.status(201).json({ message: 'Session and records saved successfully', sessionId: savedSession._id });
  } catch (err) {
    console.error('Error saving export session:', err);
    res.status(500).json({ error: 'Internal server error while saving data' });
  }
});

// 3. Get all Export Sessions (History) (PROTECTED)
app.get('/api/export-sessions', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const sessions = await ExportSession.find({ userId: req.user._id }).select('-records').sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// 4. Get Global Stats (PROTECTED)
app.get('/api/stats', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const sessions = await ExportSession.find({ userId: req.user._id }).select('originalRecords duplicatesRemoved finalCleanRecords');
    const stats = sessions.reduce((acc, curr) => ({
      totalFiles: acc.totalFiles + 1,
      totalRecords: acc.totalRecords + curr.originalRecords,
      totalRemoved: acc.totalRemoved + curr.duplicatesRemoved,
      totalClean: acc.totalClean + curr.finalCleanRecords
    }), { totalFiles: 0, totalRecords: 0, totalRemoved: 0, totalClean: 0 });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// 5. Get Specific Session (with records) (PROTECTED)
app.get('/api/export-sessions/:id', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const session = await ExportSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch session details' });
  }
});

// 6. Delete Specific Session (PROTECTED)
app.delete('/api/export-sessions/:id', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const session = await ExportSession.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Start Server (checking import.meta.url for ESM equivalent of require.main === module)
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
