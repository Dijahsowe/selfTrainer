import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required").max(100, "Subject name too long"),
});

export const createStudyMaterialSchema = z.object({
  title: z.string().min(1, "Title is required").max(150, "Title cannot exceed 150 characters"),
  subjectId: z.string().optional().nullable(),
  sourceText: z
    .string()
    .min(100, "Content must be at least 100 characters")
    .max(50000, "Content cannot exceed 50,000 characters"),
});

export const updateStudyMaterialSchema = createStudyMaterialSchema.partial();
