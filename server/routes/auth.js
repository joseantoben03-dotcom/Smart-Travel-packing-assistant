const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route    POST api/auth/register
// @desc     Register user
// @access   Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('Registration attempt:', { name, email, passwordLength: password?.length });

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      console.log('User already exists:', email);
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    await user.save();
    console.log('User created successfully:', user.email);

    // Generate JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          console.error('JWT sign error:', err);
          throw err;
        }
        
        res.json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        });
      }
    );
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 11000) {
      // Duplicate key error
      return res.status(400).json({ msg: 'User already exists' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route    POST api/auth/login
// @desc     Authenticate user & get token
// @access   Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email, passwordLength: password?.length });

    // Validation
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please provide email and password' });
    }

    // Find user
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    console.log('User found:', user.email);

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    console.log('Login successful for user:', user.email);

    // Generate JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          console.error('JWT sign error:', err);
          throw err;
        }
        
        res.json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route    GET api/auth/me
// @desc     Get user by token
// @access   Private
router.get('/me', auth, async (req, res) => {
  try {
    console.log('Getting user info for:', req.user?.email || req.user?.id);
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

module.exports = router;