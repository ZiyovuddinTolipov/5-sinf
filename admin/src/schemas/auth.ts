import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email kiritish shart")
    .email("Email formati noto'g'ri"),
  password: z
    .string()
    .min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
