import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: [String],
    repo: String,   // GitHub/Code URL
    demo: String,   // Live URL
    image: String,  // Screenshot/cover
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 }, // for manual sorting (lower = earlier)
  },
  { timestamps: true }
);

// helpful indexes
projectSchema.index({ featured: -1, order: 1, createdAt: -1 });

projectSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

export default mongoose.model("Project", projectSchema);
