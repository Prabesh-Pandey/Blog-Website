const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// NOTE: This file contains the auth endpoints. It's intentionally kept small and readable so
// new contributors (e.g. interns) can understand how signup/login work.
// TODO: add unit tests and rate limiting in a later iteration.

// POST /auth/signup
// Accepts: { password }
// Generates a unique random username and returns { token, user: { id, username } }
router.post('/signup', async (req, res) => {
  let { username, password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });

  try {
    // if username provided, validate and ensure uniqueness
    if (username) {
      username = String(username).trim().toLowerCase();
      // basic validation: 3-30 chars, letters, numbers, -, _
      const ok = /^[a-z0-9_-]{3,30}$/.test(username);
      if (!ok) return res.status(400).json({ error: 'Username must be 3-30 characters using letters, numbers, underscore or hyphen' });

      const exists = await User.findOne({ username });
      if (exists) return res.status(400).json({ error: 'Username already taken' });
    } else {
      // generate a random username and ensure uniqueness
      function genUsername() {
        return 'user' + Math.random().toString(36).substring(2, 8);
      }

      let attempts = 0;
      let generated = genUsername();
      while (await User.findOne({ username: generated })) {
        generated = genUsername();
        attempts++;
        if (attempts > 8) break;
      }

      const finalCheck = await User.findOne({ username: generated });
      if (finalCheck) return res.status(500).json({ error: 'Failed to generate unique username, try again' });
      username = generated;
    }

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash });
    await user.save();

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || 'change-this-secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
    console.error(err);
    // if duplicate key slips through
    if (err.code === 11000) return res.status(400).json({ error: 'Username already taken' });
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /auth/login
// Accepts: { username, password }
router.post('/login', async (req, res) => {
  let { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  username = String(username).trim().toLowerCase();

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || 'change-this-secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
