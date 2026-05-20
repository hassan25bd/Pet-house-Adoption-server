const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

module.exports = (petsCollection, requestsCollection) => {
  // ── PUBLIC ROUTES ──────────────────────────────────────────────

  // Featured pets for home page (latest 6 available)
  router.get('/featured', async (req, res) => {
    const pets = await petsCollection
      .find({ status: 'available' })
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();
    res.send(pets);
  });

  // All pets with search ($regex), filter ($in) and sort
  router.get('/', async (req, res) => {
    const { search, species, sort } = req.query;
    const query = { status: 'available' };

    if (search) query.name = { $regex: search, $options: 'i' };
    if (species && species !== 'all') query.species = { $in: [species] };

    const sortMap = {
      price_asc:  { adoptionFee: 1 },
      price_desc: { adoptionFee: -1 },
      age_asc:    { age: 1 },
      age_desc:   { age: -1 },
      newest:     { createdAt: -1 },
    };
    const sortOption = sortMap[sort] || { createdAt: -1 };

    const pets = await petsCollection.find(query).sort(sortOption).toArray();
    res.send(pets);
  });

  // Platform statistics
  router.get('/stats', async (req, res) => {
    const [totalPets, adoptedPets, availablePets, totalUsers] = await Promise.all([
      petsCollection.countDocuments(),
      petsCollection.countDocuments({ status: 'adopted' }),
      petsCollection.countDocuments({ status: 'available' }),
      requestsCollection.countDocuments(),
    ]);
    res.send({ totalPets, adoptedPets, availablePets, totalUsers });
  });

  // Single pet details
  router.get('/:id', async (req, res) => {
    const pet = await petsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!pet) return res.status(404).send({ message: 'Pet not found' });
    res.send(pet);
  });

  // ── PRIVATE ROUTES ─────────────────────────────────────────────

  // Add new pet
  router.post('/', verifyToken, async (req, res) => {
    const pet = { ...req.body, status: 'available', createdAt: new Date() };
    const result = await petsCollection.insertOne(pet);
    res.send(result);
  });

  // My listings with request counts
  router.get('/owner/my-listings', verifyToken, async (req, res) => {
    const pets = await petsCollection
      .find({ ownerEmail: req.user.email })
      .sort({ createdAt: -1 })
      .toArray();

    const petsWithCounts = await Promise.all(
      pets.map(async (pet) => {
        const count = await requestsCollection.countDocuments({ petId: pet._id.toString() });
        return { ...pet, requestCount: count };
      })
    );
    res.send(petsWithCounts);
  });

  // Update pet (owner only)
  router.put('/:id', verifyToken, async (req, res) => {
    const pet = await petsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!pet) return res.status(404).send({ message: 'Pet not found' });
    if (pet.ownerEmail !== req.user.email)
      return res.status(403).send({ message: 'Forbidden access' });

    const { _id, ...updateData } = req.body;
    const result = await petsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    res.send(result);
  });

  // Delete pet (owner only) — also removes all its requests
  router.delete('/:id', verifyToken, async (req, res) => {
    const pet = await petsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!pet) return res.status(404).send({ message: 'Pet not found' });
    if (pet.ownerEmail !== req.user.email)
      return res.status(403).send({ message: 'Forbidden access' });

    await requestsCollection.deleteMany({ petId: req.params.id });
    const result = await petsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  });

  return router;
};
