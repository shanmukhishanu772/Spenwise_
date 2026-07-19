const express = require('express');
const auth = require('../middleware/auth');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const incomes = await Income.find({ user: req.user._id, date: { $gte: new Date(year || new Date().getFullYear(), month ? month - 1 : 0, 1), $lt: new Date(year || new Date().getFullYear(), month ? month : 12, 1) } });
    const expenses = await Expense.find({ user: req.user._id, date: { $gte: new Date(year || new Date().getFullYear(), month ? month - 1 : 0, 1), $lt: new Date(year || new Date().getFullYear(), month ? month : 12, 1) } });

    const incomeTotal = incomes.reduce((sum, item) => sum + item.amount, 0);
    const expenseTotal = expenses.reduce((sum, item) => sum + item.amount, 0);
    const savings = incomeTotal - expenseTotal;
    const highestExpenseCategory = Object.entries(expenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {})).sort((a, b) => b[1] - a[1])[0];
    const highestIncomeSource = Object.entries(incomes.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + item.amount;
      return acc;
    }, {})).sort((a, b) => b[1] - a[1])[0];

    res.json({
      month: month || 'all',
      year: year || new Date().getFullYear(),
      incomeTotal,
      expenseTotal,
      savings,
      remainingBalance: incomeTotal - expenseTotal,
      highestExpenseCategory: highestExpenseCategory ? highestExpenseCategory[0] : 'N/A',
      highestIncomeSource: highestIncomeSource ? highestIncomeSource[0] : 'N/A',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

module.exports = router;
