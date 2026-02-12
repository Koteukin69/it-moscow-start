import {z} from 'zod';

export const phoneRegex = /^(\+7|8)9\d{9}$/;

export const loginSchema = z.object({
  name: z.string(),
  phone: z.union([
    z.string().trim().regex(phoneRegex, "Введите корректный номер телефона."),
    z.literal("").transform(() => undefined),
  ]).optional(),
})