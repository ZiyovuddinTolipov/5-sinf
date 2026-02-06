import { z } from "zod";

export const subjectSchema = z.object({
  name: z
    .string()
    .min(2, "Fan nomi kamida 2 ta belgidan iborat bo'lishi kerak")
    .max(100, "Fan nomi 100 ta belgidan oshmasligi kerak"),
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;
