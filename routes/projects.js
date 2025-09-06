import { Router } from "express";
import { z } from "zod";
import Project from "../models/Project.js";

const router = Router();

// GET /api/projects?limit=12&featured=true
router.get("/", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit ?? "100", 10) || 100, 200);
  const featured =
    typeof req.query.featured === "string"
      ? req.query.featured === "true"
      : undefined;

  const filter = {};
  if (featured !== undefined) filter.featured = featured;

  const docs = await Project.find(filter)
    .sort({ featured: -1, order: 1, createdAt: -1 })
    .limit(limit)
    .lean();

  res.json(docs.map(({ _id, ...rest }) => ({ id: _id, ...rest })));
});

// Validation schema for create/update
const ProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string()).optional(),
  repo: z.string().url().optional(),
  demo: z.string().url().optional(),
  image: z.string().url().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().optional(),
});

// POST /api/projects  (admin header)
router.post("/", async (req, res) => {
  const token = req.header("x-admin-token");
  if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const parsed = ProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

  const created = await Project.create(parsed.data);
  res.status(201).json({ id: created._id.toString() });
});

// (Optional) PATCH /api/projects/:id
router.patch("/:id", async (req, res) => {
  const token = req.header("x-admin-token");
  if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const parsed = ProjectSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

  const updated = await Project.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json({ id: updated._id.toString() });
});

// (Optional) DELETE /api/projects/:id
router.delete("/:id", async (req, res) => {
  const token = req.header("x-admin-token");
  if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const out = await Project.findByIdAndDelete(req.params.id);
  if (!out) return res.status(404).json({ error: "Not found" });
  res.status(204).end();
});

export default router;
