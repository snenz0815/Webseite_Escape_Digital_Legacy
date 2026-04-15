import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import pkg from 'pg';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { Pool } = pkg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'db.json');
const UPLOAD_DIR = join(__dirname, '..', 'public', 'uploads');

if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Database Connection
let pool = null;
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('DEIN_PASSWORT')) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  console.log('PostgreSQL connection automatically configured for relational DB.');
}

async function initDB() {
  if (!pool) return;
  try {
    // Drop old wrapper table if user was stuck with it earlier
    await pool.query(`DROP TABLE IF EXISTS store`);

    // Core Relation 1: document_types
    await pool.query(`
      CREATE TABLE IF NOT EXISTS document_types (
        id VARCHAR PRIMARY KEY,
        label VARCHAR
      )
    `);

    // Core Relation 2: platforms
    await pool.query(`
      CREATE TABLE IF NOT EXISTS platforms (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        category VARCHAR,
        logo_url TEXT,
        price NUMERIC,
        specs JSONB,
        required_documents JSONB,
        contact_address JSONB,
        status VARCHAR
      )
    `);

    // Check if platforms is empty to migrate from db.json
    const res = await pool.query(`SELECT COUNT(*) FROM platforms`);
    if (parseInt(res.rows[0].count) === 0) {
      console.log('Migrating data from local db.json into relational tables...');
      const localData = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
      
      // Seed doc types
      for (const [key, val] of Object.entries(localData.documentTypes || {})) {
        await pool.query(`INSERT INTO document_types (id, label) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [key, val]);
      }

      // Seed platforms
      for (const p of localData.platforms) {
        await pool.query(`
          INSERT INTO platforms (id, name, category, logo_url, price, specs, required_documents, contact_address, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          p.id, 
          p.name, 
          p.category, 
          p.logoUrl || '', 
          p.price || 0, 
          p.specs || {}, 
          p.requiredDocuments ? JSON.stringify(p.requiredDocuments) : null,
          p.contactAddress ? JSON.stringify(p.contactAddress) : null,
          p.status || 'active'
        ]);
      }
      console.log('Migration completed successfully!');
    }
  } catch (e) {
    console.error('Failed to initialize PostgreSQL tables:', e);
  }
}

// ----------------------------------------------------
// DB ABSTRACTION LAYER (Relational vs File JSON)
// ----------------------------------------------------

async function getDocumentTypes() {
  if (pool) {
    const res = await pool.query('SELECT * FROM document_types');
    const dts = {};
    res.rows.forEach(r => { dts[r.id] = r.label; });
    return dts;
  }
  return JSON.parse(readFileSync(DB_PATH, 'utf-8')).documentTypes || {};
}

async function getPlatforms() {
  if (pool) {
    const res = await pool.query('SELECT * FROM platforms ORDER BY name ASC');
    return res.rows.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      logoUrl: r.logo_url,
      price: parseFloat(r.price),
      specs: r.specs,
      requiredDocuments: r.required_documents || [],
      contactAddress: r.contact_address || {},
      status: r.status
    }));
  }
  return JSON.parse(readFileSync(DB_PATH, 'utf-8')).platforms;
}

// ----------------------------------------------------

const app = express();
app.use(cors());
app.use(express.json());

initDB();

// GET active platforms
app.get('/api/platforms', async (_, res) => {
  try {
    const platforms = await getPlatforms();
    res.json(platforms.filter(p => p.status === 'active'));
  } catch(e) { res.status(500).json({error: e.message}); }
});

// Create Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { selectedPlatforms } = req.body;
    if (!selectedPlatforms || !Array.isArray(selectedPlatforms) || selectedPlatforms.length === 0) {
      return res.status(400).json({ error: 'No platforms selected' });
    }

    const platforms = await getPlatforms();
    let totalAmount = 0;
    
    selectedPlatforms.forEach(id => {
      const p = platforms.find(pl => pl.id === id);
      if (p && p.price) totalAmount += p.price;
    });

    if (totalAmount <= 0) totalAmount = 10;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100, // EUR in cents
      currency: 'eur',
      description: `Digital-Swipe Account-Abmeldung: ${selectedPlatforms.join(', ')}`,
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: paymentIntent.client_secret, totalAmount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET document types
app.get('/api/document-types', async (_, res) => {
  try {
    res.json(await getDocumentTypes());
  } catch(e) { res.status(500).json({error: e.message}); }
});

// ----------------------------------------------------
// ADMIN ROUTES
// ----------------------------------------------------

app.get('/api/admin/platforms', async (_, res) => {
  try {
    res.json(await getPlatforms());
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/admin/platforms', upload.single('logo'), async (req, res) => {
  try {
    const { name, category, usernameRequired, emailRequired, placeholderText } = req.body;
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
    const logoUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.logoUrl || '');
    
    const specs = {
      usernameRequired: usernameRequired === 'true',
      emailRequired: emailRequired === 'true',
      placeholderText: placeholderText || '@benutzername'
    };

    const newPlatform = { id, name, category, logoUrl, price: 0, specs, requiredDocuments: [], contactAddress: {}, status: 'active' };

    if (pool) {
      await pool.query(`
        INSERT INTO platforms (id, name, category, logo_url, price, specs, required_documents, contact_address, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [id, name, category, logoUrl, 0, specs, '[]', '{}', 'active']);
    } else {
      const db = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
      db.platforms.push(newPlatform);
      writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    }
    res.status(201).json(newPlatform);
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.put('/api/admin/platforms/:id', async (req, res) => {
  try {
    if (pool) {
      const id = req.params.id;
      // Build dynamic update
      const updates = [];
      const values = [];
      let i = 1;
      const validFields = ['name', 'category', 'logoUrl', 'price', 'specs', 'requiredDocuments', 'contactAddress'];
      for (const [key, val] of Object.entries(req.body)) {
        if (validFields.includes(key)) {
          let dbKey = key;
          if (key === 'logoUrl') dbKey = 'logo_url';
          if (key === 'requiredDocuments') dbKey = 'required_documents';
          if (key === 'contactAddress') dbKey = 'contact_address';
          
          updates.push(`${dbKey} = $${i}`);
          values.push(typeof val === 'object' ? JSON.stringify(val) : val);
          i++;
        }
      }
      if (updates.length > 0) {
        values.push(id);
        await pool.query(`UPDATE platforms SET ${updates.join(', ')} WHERE id = $${i}`, values);
      }
      res.json({ success: true });
    } else {
      const db = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
      const idx = db.platforms.findIndex(p => p.id === req.params.id);
      db.platforms[idx] = { ...db.platforms[idx], ...req.body };
      writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
      res.json(db.platforms[idx]);
    }
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.delete('/api/admin/platforms/:id', async (req, res) => {
  try {
    if (pool) {
      await pool.query(`DELETE FROM platforms WHERE id = $1`, [req.params.id]);
    } else {
      const db = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
      db.platforms = db.platforms.filter(p => p.id !== req.params.id);
      writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    }
    res.json({ success: true });
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.patch('/api/admin/platforms/:id/toggle', async (req, res) => {
  try {
    if (pool) {
      const p = await pool.query('SELECT status FROM platforms WHERE id = $1', [req.params.id]);
      if (p.rowCount === 0) return res.status(404).json({error: 'Not found'});
      const newStatus = p.rows[0].status === 'active' ? 'inactive' : 'active';
      await pool.query('UPDATE platforms SET status = $1 WHERE id = $2', [newStatus, req.params.id]);
      res.json({ id: req.params.id, status: newStatus });
    } else {
      const db = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
      const p = db.platforms.find(pl => pl.id === req.params.id);
      if (!p) return res.status(404).json({ error: 'Not found' });
      p.status = p.status === 'active' ? 'inactive' : 'active';
      writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
      res.json(p);
    }
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.listen(3001, () => console.log('API server running on http://localhost:3001'));
