require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ExportSession } = require('./models/Record');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit to support large arrays of records

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
.then(() => console.log('Successfully connected to MongoDB!'))
.catch((err) => console.error('MongoDB connection error:', err));

// --- API Routes ---

// 1. Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// 2. Save new Export Session & Records
app.post('/api/export-sessions', async (req, res) => {
  try {
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
    // Return sessions without the large records array to save bandwidth on the list view
    const sessions = await ExportSession.find().select('-records').sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
