import mongoose from "mongoose";

export const MEMORY_CATEGORIES = [
  "profile",  
  "preference",  
  "skill",  
  "project",  
  "goal", 
  "style", 
  "context",  
];

const memorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, 
    content: { type: String, required: true, maxlength: 300 },
    category: { type: String, enum: MEMORY_CATEGORIES, default: "context" }, 
    importance: { type: Number, min: 1, max: 5, default: 3 },
    sourceConversationId: { type: String },
  },
  { timestamps: true },
);
 
memorySchema.index({ userId: 1, importance: -1, updatedAt: -1 });
 
const memorySettingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Memory =
  mongoose.models.Memory || mongoose.model("Memory", memorySchema);
export const MemorySetting =
  mongoose.models.MemorySetting ||
  mongoose.model("MemorySetting", memorySettingSchema);
