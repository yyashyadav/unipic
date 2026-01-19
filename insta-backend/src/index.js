import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import pool from './db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(express.json());

// these are routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);



console.log("DATABASE_URL:", process.env.DATABASE_URL);
app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ error: "DB not connected" });
  }
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});