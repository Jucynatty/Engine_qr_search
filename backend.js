import express from 'express';
import cors from 'cors';
import qr from 'qr-image';
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  readFileSync('./firebase-key.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express(); // this is the express app

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// Create engine
app.post('/api/engines', async (req, res) => {
  const engineData = req.body;

  if (!engineData.serialNumber) {
    return res.status(400).json({ error: 'Serial Number is required' });
  } // error check

  try {
    const docRef = await db.collection('engines').add(engineData);
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read engines
app.get('/api/engines', async (_, res) => {
  try {
    const snapshot = await db.collection('engines').get();
    const engines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(engines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Generate QR code for engine
app.get('/api/qr/:id', (req, res) => {
  const { id } = req.params;
  const hostUrl = process.env.HOST_URL || 'http://localhost:3000';
  const qrSvg = qr.image(`${hostUrl}/engine/${id}`, { type: 'png' });
  res.type('png');
  qrSvg.pipe(res);
});

// Update engine
app.put('/api/engines/:id', async (req, res) => {
  const { id } = req.params;
  const { model, year } = req.body;

  try {
    await db.collection('engines').doc(id).update({ model, year });
    res.status(200).json({ message: 'Engine updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete engine
app.delete('/api/engines/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.collection('engines').doc(id).delete();
    res.status(200).json({ message: 'Engine deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// QR code redirect

app.get('/engine/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'engine.html'));
});

// get engine on QR scan
// Get a single engine by ID
app.get('/api/engines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('engines').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Engine not found' });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
