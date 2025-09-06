import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { z } from 'zod';
import mongoose from 'mongoose';
import projectsRouter from "./routes/projects.js";

import { connectDB } from './db/mongo.js';           // ← add
import experienceRouter from './routes/experience.js';


const app = express();
const PORT = process.env.PORT || 5174;
const ORIGIN = process.env.ORIGIN || 'http://localhost:5173';


app.use(helmet());
app.use(cors({
  origin: ORIGIN,
  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-token'],
}));
app.use(express.json());
app.use(morgan('dev'));

app.get("/api/db", (_req, res) => {
    const states = ["disconnected","connected","connecting","disconnecting","uninitialized","connecting (2)"];
    res.json({ state: states[mongoose.connection.readyState] ?? mongoose.connection.readyState });
  });


app.get('/api/health', (req, res) => {
res.json({ ok: true, time: new Date().toISOString() });
});


// app.get('/api/projects', (req, res) => {
// res.json(projects);
// });

app.use('/api/experience', experienceRouter);

app.use("/api/projects", projectsRouter);


app.post('/api/contact', (req, res) => {
const ContactSchema = z.object({
name: z.string().min(1),
email: z.string().email(),
message: z.string().min(10).max(2000)
});


const parsed = ContactSchema.safeParse(req.body);
if (!parsed.success) {
return res.status(400).json({ error: parsed.error.issues });
}


// TODO: send an email or push to a DB/queue
console.log('📩 Contact form received:', parsed.data);
res.status(201).json({ ok: true });
});


app.use((req, res) => {
res.status(404).json({ error: 'Not Found' });
});


(async () => {
  try {
    await connectDB();
  } catch (e) {
    console.error('Mongo connect failed:', e.message);
  }
  app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
})();