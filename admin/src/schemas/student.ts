import { z } from "zod";

export const studentSchema = z.object({
  email: z
    .string()
    .email("To'g'ri email manzilini kiriting"),
  password: z
    .string()
    .min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
  full_name: z
    .string()
    .min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak")
    .max(100, "Ism 100 ta belgidan oshmasligi kerak"),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

export const studentUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak")
    .max(100, "Ism 100 ta belgidan oshmasligi kerak"),
});

export type StudentUpdateValues = z.infer<typeof studentUpdateSchema>;
