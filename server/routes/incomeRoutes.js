const express = require('express');
const auth = require('../middleware/auth');
const Income = require('../models/Income');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user._id }).sort({ date: -1 });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch incomes' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const income = await Income.create({ ...req.body, user: req.user._id });
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create income' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!income) return res.status(404).json({ message: 'Income not found' });
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update income' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!income) return res.status(404).json({ message: 'Income not found' });
    res.json({ message: 'Income deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete income' });
  }
});

module.exports = router;
