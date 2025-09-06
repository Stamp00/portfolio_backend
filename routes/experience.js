import { Router } from "express";
import { z } from "zod";
import Experience from "../models/Experience.js";

const router = Router();

// GET /api/experience?limit=10
router.get("/", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit ?? "100", 10) || 100, 200);
  const docs = await Experience.find().sort({ start: -1 }).limit(limit).lean();
  res.json(docs.map(({ _id, ...rest }) => ({ id: _id, ...rest })));
});

const ExperienceSchema = z.object({
  title: z.string().min(1),
  org: z.string().min(1),
  location: z.string().optional(),
  employmentType: z.enum(["full-time","part-time","contract","internship","freelance","volunteer"]).optional(),
  start: z.string().regex(/^\d{4}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}$|^present$/).optional(),
  bullets: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

// POST /api/experience  (admin-only via header)
router.post("/", async (req, res) => {
  const token = req.header("x-admin-token");
  if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parsed = ExperienceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

  const created = await Experience.create(parsed.data);
  res.status(201).json({ id: created._id.toString() });
});

export default router;
