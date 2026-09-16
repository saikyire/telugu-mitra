import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { ExportSession } from './models/Record.js';
import connectDB from './db.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit to support large arrays of records

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().catch(console.error);

// --- API Routes ---

// 1. Healthcheck
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok', 
    message: 'Backend is running',
    database: dbStatus 
  });
});

// 2. Save new Export Session & Records
app.post('/api/export-sessions', async (req, res) => {
  try {
    await connectDB();
    const { filename, stats, records } = req.body;

    if (!filename || !stats || !records) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newSession = new ExportSession({
      filename,
      originalRecords: stats.originalRecords,
      duplicatesRemoved: stats.duplicatesRemoved,
      finalCleanRecords: stats.finalCleanRecords,
      records: records, // Store the array of objects directly
    });

    const savedSession = await newSession.save();
    res.status(201).json({ message: 'Session and records saved successfully', sessionId: savedSession._id });
  } catch (err) {
    console.error('Error saving export session:', err);
    res.status(500).json({ error: 'Internal server error while saving data' });
  }
});

// 3. Get all Export Sessions (History)
app.get('/api/export-sessions', async (req, res) => {
  try {
    await connectDB();
    // Return sessions without the large records array to save bandwidth on the list view
    const sessions = await ExportSession.find().select('-records').sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// 4. Get Global Stats
app.get('/api/stats', async (req, res) => {
  try {
    await connectDB();
    const sessions = await ExportSession.find().select('originalRecords duplicatesRemoved finalCleanRecords');
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

// 5. Get Specific Session (with records)
app.get('/api/export-sessions/:id', async (req, res) => {
  try {
    await connectDB();
    const session = await ExportSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch session details' });
  }
});

// 6. Delete Specific Session
app.delete('/api/export-sessions/:id', async (req, res) => {
  try {
    await connectDB();
    await ExportSession.findByIdAndDelete(req.params.id);
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
