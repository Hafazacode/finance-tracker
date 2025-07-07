import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  upsertBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  createDebt,
  getUpcomingDebts,
  updateDebt,
  deleteDebt,
} from "../database.js";

const router = express.Router();

// ========== KATEGORI ==========
router.get("/categories", async (req, res) => {
  const categories = await getCategories(req.session.userId);
  res.json(categories);
});

router.post("/categories", async (req, res) => {
  const { name } = req.body;
  const id = await createCategory(req.session.userId, name);
  res.json({ id });
});

router.put("/categories/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  await updateCategory(id, name);
  res.sendStatus(200);
});

router.delete("/categories/:id", async (req, res) => {
  const { id } = req.params;
  await deleteCategory(id);
  res.sendStatus(200);
});

// ========== TRANSAKSI ==========
router.get("/transactions", async (req, res) => {
  const transactions = await getTransactions(req.session.userId);
  res.json(transactions);
});

router.post("/transactions", async (req, res) => {
  const { categoryId, type, amount, description, date } = req.body;
  const id = await createTransaction(
    req.session.userId,
    categoryId,
    type,
    amount,
    description,
    date
  );
  res.json({ id });
});

router.put("/transactions/:id", async (req, res) => {
  const { id } = req.params;
  const { categoryId, type, amount, description, date } = req.body;
  await updateTransaction(id, categoryId, type, amount, description, date);
  res.sendStatus(200);
});

router.delete("/transactions/:id", async (req, res) => {
  const { id } = req.params;
  await deleteTransaction(id);
  res.sendStatus(200);
});

// ========== ANGGARAN ==========
router.get("/budgets", async (req, res) => {
  const { month, year } = req.query;
  const budgets = await getBudgets(req.session.userId, month, year);
  res.json(budgets);
});

router.post("/budgets", async (req, res) => {
  const { categoryId, month, year, amount } = req.body;
  await upsertBudget(req.session.userId, categoryId, month, year, amount);
  res.sendStatus(200);
});

router.put("/budgets/:id", async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  await updateBudget(id, amount);
  res.sendStatus(200);
});

router.delete("/budgets/:id", async (req, res) => {
  const { id } = req.params;
  await deleteBudget(id);
  res.sendStatus(200);
});

// ========== UTANG ==========
router.get("/debts/upcoming", async (req, res) => {
  const debts = await getUpcomingDebts(req.session.userId);
  res.json(debts);
});

router.post("/debts", async (req, res) => {
  const { description, totalAmount, dueDate } = req.body;
  const id = await createDebt(
    req.session.userId,
    description,
    totalAmount,
    dueDate
  );
  res.json({ id });
});

router.put("/debts/:id", async (req, res) => {
  const { id } = req.params;
  const { amountPaid } = req.body;
  await updateDebt(id, amountPaid);
  res.sendStatus(200);
});

router.delete("/debts/:id", async (req, res) => {
  const { id } = req.params;
  await deleteDebt(id);
  res.sendStatus(200);
});

export default router;
