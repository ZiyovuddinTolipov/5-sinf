import { z } from "zod";

export const lessonSchema = z.object({
  subject_id: z.string().uuid("Fan tanlang"),
  title: z
    .string()
    .min(2, "Darslik nomi kamida 2 ta belgidan iborat bo'lishi kerak")
    .max(200, "Darslik nomi 200 ta belgidan oshmasligi kerak"),
});

export type LessonFormValues = z.infer<typeof lessonSchema>;
