const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

module.exports = (petsCollection, requestsCollection) => {
  // Submit adoption request (prevents owner from self-adopting)
  router.post('/', verifyToken, async (req, res) => {
    const { petId, userEmail, userName, pickupDate, message } = req.body;

    const pet = await petsCollection.findOne({ _id: new ObjectId(petId) });
    if (!pet) return res.status(404).send({ message: 'Pet not found' });
    if (pet.status === 'adopted')
      return res.status(400).send({ message: 'This pet has already been adopted' });
    if (pet.ownerEmail === userEmail)
      return res.status(403).send({ message: 'You cannot adopt your own pet' });

    const existing = await requestsCollection.findOne({ petId, userEmail });
    if (existing)
      return res.status(400).send({ message: 'You have already requested to adopt this pet' });

    const result = await requestsCollection.insertOne({
      petId,
      petName: pet.name,
      petImage: pet.image,
      ownerEmail: pet.ownerEmail,
      userEmail,
      userName,
      pickupDate,
      message,
      status: 'pending',
      requestDate: new Date(),
    });
    res.send(result);
  });

  // My adoption requests
  router.get('/my', verifyToken, async (req, res) => {
    const requests = await requestsCollection
      .find({ userEmail: req.user.email })
      .sort({ requestDate: -1 })
      .toArray();
    res.send(requests);
  });

  // Requests for a specific pet (owner only)
  router.get('/pet/:petId', verifyToken, async (req, res) => {
    const pet = await petsCollection.findOne({ _id: new ObjectId(req.params.petId) });
    if (!pet) return res.status(404).send({ message: 'Pet not found' });
    if (pet.ownerEmail !== req.user.email)
      return res.status(403).send({ message: 'Forbidden access' });

    const requests = await requestsCollection
      .find({ petId: req.params.petId })
      .sort({ requestDate: -1 })
      .toArray();
    res.send(requests);
  });

  // Approve: marks pet adopted, rejects all other requests
  router.patch('/:id/approve', verifyToken, async (req, res) => {
    const request = await requestsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!request) return res.status(404).send({ message: 'Request not found' });

    const pet = await petsCollection.findOne({ _id: new ObjectId(request.petId) });
    if (pet.ownerEmail !== req.user.email)
      return res.status(403).send({ message: 'Forbidden access' });

    await requestsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'approved' } }
    );
    await requestsCollection.updateMany(
      { petId: request.petId, _id: { $ne: new ObjectId(req.params.id) } },
      { $set: { status: 'rejected' } }
    );
    await petsCollection.updateOne(
      { _id: new ObjectId(request.petId) },
      { $set: { status: 'adopted' } }
    );
    res.send({ success: true });
  });

  // Reject a single request
  router.patch('/:id/reject', verifyToken, async (req, res) => {
    const request = await requestsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!request) return res.status(404).send({ message: 'Request not found' });

    const pet = await petsCollection.findOne({ _id: new ObjectId(request.petId) });
    if (pet.ownerEmail !== req.user.email)
      return res.status(403).send({ message: 'Forbidden access' });

    const result = await requestsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'rejected' } }
    );
    res.send(result);
  });

  // Cancel own request (requester only)
  router.delete('/:id', verifyToken, async (req, res) => {
    const request = await requestsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!request) return res.status(404).send({ message: 'Request not found' });
    if (request.userEmail !== req.user.email)
      return res.status(403).send({ message: 'Forbidden access' });

    const result = await requestsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  });

  return router;
};
