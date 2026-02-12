import {z} from 'zod';

export const loginSchema = z.object({
  name: z.string(),
  phone: z.union([
    z.string().trim().regex(/^(\+7|8)9\d{9}$/, "Введите корректный номер телефона."),
    z.literal("").transform(() => undefined),
  ]).optional(),
})