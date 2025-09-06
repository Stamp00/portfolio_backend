import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    org: { type: String, required: true },
    location: String,
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "freelance", "volunteer"],
    },
    start: { type: String, required: true }, // "YYYY-MM"
    end: { type: String },                   // "YYYY-MM" or "present"
    bullets: [String],
    tags: [String],
  },
  { timestamps: true }
);

// sort helper index (newest first)
experienceSchema.index({ start: -1 });

experienceSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => { ret.id = ret._id; delete ret._id; },
});

export default mongoose.model("Experience", experienceSchema);
