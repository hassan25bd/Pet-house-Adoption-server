const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const authRoutes     = require('./routes/auth');
const userRoutes     = require('./routes/users');
const petRoutes      = require('./routes/pets');
const requestRoutes  = require('./routes/requests');

const app  = express();
const port = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      cb(null, true);
    } else {
      cb(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// ── MONGODB ───────────────────────────────────────────────────────
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db               = client.db('petAdoptionDB');
    const petsCollection   = db.collection('pets');
    const requestsCollection = db.collection('requests');
    const usersCollection  = db.collection('users');

    // ── ROUTES ───────────────────────────────────────────────────
    app.use('/',          authRoutes);
    app.use('/users',     userRoutes(usersCollection));
    app.use('/pets',      petRoutes(petsCollection, requestsCollection));
    app.use('/requests',  requestRoutes(petsCollection, requestsCollection));

    // Legacy aliases kept for backward compatibility
    app.get('/featured-pets', async (req, res) => {
      const pets = await petsCollection
        .find({ status: 'available' })
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();
      res.send(pets);
    });

    app.get('/my-pets', async (req, res) => res.redirect('/pets/owner/my-listings'));
    app.get('/my-requests', async (req, res) => res.redirect('/requests/my'));

    app.get('/stats', async (req, res) => {
      const [totalPets, adoptedPets, availablePets, totalUsers] = await Promise.all([
        petsCollection.countDocuments(),
        petsCollection.countDocuments({ status: 'adopted' }),
        petsCollection.countDocuments({ status: 'available' }),
        usersCollection.countDocuments(),
      ]);
      res.send({ totalPets, adoptedPets, availablePets, totalUsers });
    });

    app.get('/', (req, res) => res.send('🐾 Pet Adoption House Server is running'));

    await client.db('admin').command({ ping: 1 });
    console.log('✅  Connected to MongoDB successfully');
  } catch (err) {
    console.error('❌  Server error:', err);
  }
}

run().catch(console.dir);

app.listen(port, () => console.log(`🚀  Server running on port ${port}`));
