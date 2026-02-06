import { z } from "zod";

export const testSchema = z
  .object({
    subject_id: z.string().uuid("Fan tanlang"),
    question: z
      .string()
      .min(5, "Savol kamida 5 ta belgidan iborat bo'lishi kerak")
      .max(500, "Savol 500 ta belgidan oshmasligi kerak"),
    option_a: z.string().min(1, "A variant bo'sh bo'lmasligi kerak"),
    option_b: z.string().min(1, "B variant bo'sh bo'lmasligi kerak"),
    option_c: z.string().min(1, "C variant bo'sh bo'lmasligi kerak"),
    option_d: z.string().min(1, "D variant bo'sh bo'lmasligi kerak"),
    correct_option: z.enum(["A", "B", "C", "D"], {
      message: "To'g'ri javobni tanlang",
    }),
    points: z
      .number()
      .min(1, "Ball 1 dan kam bo'lmasligi kerak")
      .max(5, "Ball 5 dan oshmasligi kerak"),
    start_time: z.string().min(1, "Boshlanish vaqtini kiriting"),
    end_time: z.string().min(1, "Tugash vaqtini kiriting"),
  })
  .refine(
    (data) => {
      if (data.start_time && data.end_time) {
        return new Date(data.end_time) > new Date(data.start_time);
      }
      return true;
    },
    {
      message: "Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak",
      path: ["end_time"],
    }
  );

export type TestFormValues = z.infer<typeof testSchema>;
