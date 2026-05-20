const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
};

// Generate JWT and store in HTTPOnly cookie
router.post('/jwt', (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, cookieOptions).send({ success: true });
});

// Clear JWT cookie on logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { ...cookieOptions, maxAge: 0 }).send({ success: true });
});

module.exports = router;
