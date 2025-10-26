import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters long"),
  description: z.string().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  isAvailable: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();
