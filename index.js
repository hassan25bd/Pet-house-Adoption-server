const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

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

// ── LAZY MONGODB CONNECTION (serverless-safe) ─────────────────────
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

let cachedDb = null;
const getDb = async () => {
  if (!cachedDb) {
    await client.connect();
    cachedDb = client.db('petAdoptionDB');
  }
  return cachedDb;
};

// DB middleware — attaches collections to every request
app.use(async (req, res, next) => {
  if (req.path === '/' || req.path === '/health') return next();
  try {
    const db = await getDb();
    req.pets     = db.collection('pets');
    req.requests = db.collection('requests');
    req.users    = db.collection('users');
    next();
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).send({ message: 'Database connection failed' });
  }
});

// JWT middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).send({ message: 'Unauthorized access' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send({ message: 'Unauthorized access' });
    req.user = decoded;
    next();
  });
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
};

// ── HEALTH / ROOT ─────────────────────────────────────────────────
app.get('/', (req, res) => res.send('🐾 Pet Adoption House Server is running'));
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// ── AUTH ──────────────────────────────────────────────────────────
app.post('/jwt', (req, res) => {
  const token = jwt.sign(req.body, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, cookieOptions).send({ success: true });
});

app.post('/logout', (req, res) => {
  res.clearCookie('token', { ...cookieOptions, maxAge: 0 }).send({ success: true });
});

// ── USERS ─────────────────────────────────────────────────────────
app.post('/users', async (req, res) => {
  const user = req.body;
  const exists = await req.users.findOne({ email: user.email });
  if (exists) return res.send({ message: 'User already exists', insertedId: null });
  const result = await req.users.insertOne({ ...user, createdAt: new Date() });
  res.send(result);
});

// ── PETS – PUBLIC ─────────────────────────────────────────────────
app.get('/pets/featured', async (req, res) => {
  const pets = await req.pets.find({ status: 'available' }).sort({ createdAt: -1 }).limit(6).toArray();
  res.send(pets);
});

// Keep legacy alias
app.get('/featured-pets', async (req, res) => {
  const pets = await req.pets.find({ status: 'available' }).sort({ createdAt: -1 }).limit(6).toArray();
  res.send(pets);
});

app.get('/pets', async (req, res) => {
  const { search, species, sort } = req.query;
  const query = { status: 'available' };
  if (search)                      query.name    = { $regex: search, $options: 'i' };
  if (species && species !== 'all') query.species = { $in: [species] };

  const sortMap = {
    price_asc:  { adoptionFee: 1 },
    price_desc: { adoptionFee: -1 },
    age_asc:    { age: 1 },
    age_desc:   { age: -1 },
  };
  const sortOption = sortMap[sort] || { createdAt: -1 };
  const pets = await req.pets.find(query).sort(sortOption).toArray();
  res.send(pets);
});

app.get('/stats', async (req, res) => {
  const [totalPets, adoptedPets, availablePets, totalUsers] = await Promise.all([
    req.pets.countDocuments(),
    req.pets.countDocuments({ status: 'adopted' }),
    req.pets.countDocuments({ status: 'available' }),
    req.users.countDocuments(),
  ]);
  res.send({ totalPets, adoptedPets, availablePets, totalUsers });
});

app.get('/pets/:id', async (req, res) => {
  const pet = await req.pets.findOne({ _id: new ObjectId(req.params.id) });
  if (!pet) return res.status(404).send({ message: 'Pet not found' });
  res.send(pet);
});

// ── PETS – PRIVATE ────────────────────────────────────────────────
app.post('/pets', verifyToken, async (req, res) => {
  const result = await req.pets.insertOne({ ...req.body, status: 'available', createdAt: new Date() });
  res.send(result);
});

app.get('/pets/owner/my-listings', verifyToken, async (req, res) => {
  const pets = await req.pets.find({ ownerEmail: req.user.email }).sort({ createdAt: -1 }).toArray();
  const petsWithCounts = await Promise.all(
    pets.map(async (pet) => {
      const count = await req.requests.countDocuments({ petId: pet._id.toString() });
      return { ...pet, requestCount: count };
    })
  );
  res.send(petsWithCounts);
});

// Keep legacy alias
app.get('/my-pets', verifyToken, async (req, res) => {
  const pets = await req.pets.find({ ownerEmail: req.user.email }).sort({ createdAt: -1 }).toArray();
  const petsWithCounts = await Promise.all(
    pets.map(async (pet) => {
      const count = await req.requests.countDocuments({ petId: pet._id.toString() });
      return { ...pet, requestCount: count };
    })
  );
  res.send(petsWithCounts);
});

app.put('/pets/:id', verifyToken, async (req, res) => {
  const pet = await req.pets.findOne({ _id: new ObjectId(req.params.id) });
  if (!pet) return res.status(404).send({ message: 'Pet not found' });
  if (pet.ownerEmail !== req.user.email) return res.status(403).send({ message: 'Forbidden' });
  const { _id, ...updateData } = req.body;
  const result = await req.pets.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { ...updateData, updatedAt: new Date() } }
  );
  res.send(result);
});

app.delete('/pets/:id', verifyToken, async (req, res) => {
  const pet = await req.pets.findOne({ _id: new ObjectId(req.params.id) });
  if (!pet) return res.status(404).send({ message: 'Pet not found' });
  if (pet.ownerEmail !== req.user.email) return res.status(403).send({ message: 'Forbidden' });
  await req.requests.deleteMany({ petId: req.params.id });
  const result = await req.pets.deleteOne({ _id: new ObjectId(req.params.id) });
  res.send(result);
});

// ── REQUESTS ──────────────────────────────────────────────────────
app.post('/requests', verifyToken, async (req, res) => {
  const { petId, userEmail, userName, pickupDate, message } = req.body;
  const pet = await req.pets.findOne({ _id: new ObjectId(petId) });
  if (!pet) return res.status(404).send({ message: 'Pet not found' });
  if (pet.status === 'adopted') return res.status(400).send({ message: 'This pet has already been adopted' });
  if (pet.ownerEmail === userEmail) return res.status(403).send({ message: 'You cannot adopt your own pet' });

  const existing = await req.requests.findOne({ petId, userEmail });
  if (existing) return res.status(400).send({ message: 'You have already requested to adopt this pet' });

  const result = await req.requests.insertOne({
    petId, petName: pet.name, petImage: pet.image, ownerEmail: pet.ownerEmail,
    userEmail, userName, pickupDate, message, status: 'pending', requestDate: new Date(),
  });
  res.send(result);
});

app.get('/requests/my', verifyToken, async (req, res) => {
  const requests = await req.requests.find({ userEmail: req.user.email }).sort({ requestDate: -1 }).toArray();
  res.send(requests);
});

// Legacy alias
app.get('/my-requests', verifyToken, async (req, res) => {
  const requests = await req.requests.find({ userEmail: req.user.email }).sort({ requestDate: -1 }).toArray();
  res.send(requests);
});

app.get('/requests/pet/:petId', verifyToken, async (req, res) => {
  const pet = await req.pets.findOne({ _id: new ObjectId(req.params.petId) });
  if (!pet) return res.status(404).send({ message: 'Pet not found' });
  if (pet.ownerEmail !== req.user.email) return res.status(403).send({ message: 'Forbidden' });
  const requests = await req.requests.find({ petId: req.params.petId }).sort({ requestDate: -1 }).toArray();
  res.send(requests);
});

app.patch('/requests/:id/approve', verifyToken, async (req, res) => {
  const request = await req.requests.findOne({ _id: new ObjectId(req.params.id) });
  if (!request) return res.status(404).send({ message: 'Request not found' });
  const pet = await req.pets.findOne({ _id: new ObjectId(request.petId) });
  if (pet.ownerEmail !== req.user.email) return res.status(403).send({ message: 'Forbidden' });

  await req.requests.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status: 'approved' } });
  await req.requests.updateMany(
    { petId: request.petId, _id: { $ne: new ObjectId(req.params.id) } },
    { $set: { status: 'rejected' } }
  );
  await req.pets.updateOne({ _id: new ObjectId(request.petId) }, { $set: { status: 'adopted' } });
  res.send({ success: true });
});

app.patch('/requests/:id/reject', verifyToken, async (req, res) => {
  const request = await req.requests.findOne({ _id: new ObjectId(req.params.id) });
  if (!request) return res.status(404).send({ message: 'Request not found' });
  const pet = await req.pets.findOne({ _id: new ObjectId(request.petId) });
  if (pet.ownerEmail !== req.user.email) return res.status(403).send({ message: 'Forbidden' });
  const result = await req.requests.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status: 'rejected' } });
  res.send(result);
});

app.delete('/requests/:id', verifyToken, async (req, res) => {
  const request = await req.requests.findOne({ _id: new ObjectId(req.params.id) });
  if (!request) return res.status(404).send({ message: 'Request not found' });
  if (request.userEmail !== req.user.email) return res.status(403).send({ message: 'Forbidden' });
  const result = await req.requests.deleteOne({ _id: new ObjectId(req.params.id) });
  res.send(result);
});

// ── START ─────────────────────────────────────────────────────────
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
module.exports = app;
