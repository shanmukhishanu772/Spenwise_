const express = require('express');
const auth = require('../middleware/auth');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const match = { user: req.user._id };
    if (month) match.date = { $gte: new Date(year || new Date().getFullYear(), month - 1, 1), $lt: new Date(year || new Date().getFullYear(), month, 1) };

    const incomes = await Income.find(match).sort({ date: 1 });
    const expenses = await Expense.find(match).sort({ date: 1 });

    const totals = {
      income: incomes.reduce((sum, item) => sum + item.amount, 0),
      expense: expenses.reduce((sum, item) => sum + item.amount, 0),
      savings: incomes.reduce((sum, item) => sum + item.amount, 0) - expenses.reduce((sum, item) => sum + item.amount, 0),
    };

    const categories = expenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

    const monthlySpending = [];
    const monthlyIncome = [];
    for (let i = 1; i <= 12; i += 1) {
      const start = new Date((year || new Date().getFullYear()), i - 1, 1);
      const end = new Date((year || new Date().getFullYear()), i, 1);
      const monthlyExpenses = await Expense.find({ user: req.user._id, date: { $gte: start, $lt: end } });
      const monthlyIncomes = await Income.find({ user: req.user._id, date: { $gte: start, $lt: end } });
      monthlySpending.push({ month: start.toLocaleString('default', { month: 'short' }), amount: monthlyExpenses.reduce((sum, item) => sum + item.amount, 0) });
      monthlyIncome.push({ month: start.toLocaleString('default', { month: 'short' }), amount: monthlyIncomes.reduce((sum, item) => sum + item.amount, 0) });
    }

    res.json({ totals, categories, monthlySpending, monthlyIncome, incomes, expenses });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

module.exports = router;
