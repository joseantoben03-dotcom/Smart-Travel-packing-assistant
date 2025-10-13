const express = require('express');
const auth = require('../middleware/auth');
const Destination = require('../models/Destination');

const router = express.Router();

// Add packing item
router.post('/:destinationId/items', auth, async (req, res) => {
  try {
    const { name, category = 'general' } = req.body;

    const destination = await Destination.findById(req.params.destinationId);
    if (!destination) return res.status(404).json({ msg: 'Destination not found' });
    if (destination.user.toString() !== req.user.id) return res.status(401).json({ msg: 'User not authorized' });

    const newItem = { name, category, packed: false, suggested: false };
    destination.packingItems.push(newItem);
    await destination.save();

    res.json(destination);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update packing item (toggle packed status or edit item)
router.put('/:destinationId/items/:itemId', auth, async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.destinationId);
    if (!destination) return res.status(404).json({ msg: 'Destination not found' });
    if (destination.user.toString() !== req.user.id) return res.status(401).json({ msg: 'User not authorized' });

    const item = destination.packingItems.id(req.params.itemId);
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    // Safe destructuring to prevent undefined errors
    const { name, category, packed } = req.body || {};

    if (name !== undefined) item.name = name;
    if (category !== undefined) item.category = category;

    if (packed !== undefined) {
      item.packed = packed;
    } else {
      item.packed = !item.packed; // default toggle
    }

    await destination.save();
    res.json(destination);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete packing item
router.delete('/:destinationId/items/:itemId', auth, async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.destinationId);
    if (!destination) return res.status(404).json({ msg: 'Destination not found' });
    if (destination.user.toString() !== req.user.id) return res.status(401).json({ msg: 'User not authorized' });

    destination.packingItems.pull({ _id: req.params.itemId });
    await destination.save();

    res.json(destination);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Clear all packing items
router.delete('/:destinationId/items', auth, async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.destinationId);
    if (!destination) return res.status(404).json({ msg: 'Destination not found' });
    if (destination.user.toString() !== req.user.id) return res.status(401).json({ msg: 'User not authorized' });

    destination.packingItems = [];
    await destination.save();

    res.json(destination);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
