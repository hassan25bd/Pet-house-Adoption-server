const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

module.exports = (usersCollection) => {
  // Save user on first login (idempotent)
  router.post('/', async (req, res) => {
    const user = req.body;
    const exists = await usersCollection.findOne({ email: user.email });
    if (exists) return res.send({ message: 'User already exists', insertedId: null });
    const result = await usersCollection.insertOne({ ...user, createdAt: new Date() });
    res.send(result);
  });

  // Get user by email (private)
  router.get('/:email', verifyToken, async (req, res) => {
    if (req.user.email !== req.params.email)
      return res.status(403).send({ message: 'Forbidden access' });
    const user = await usersCollection.findOne({ email: req.params.email });
    res.send(user || {});
  });

  return router;
};
