import {z} from 'zod';

export const loginSchema = z.object({
  name: z.string(),
  phone: z.string().trim().regex(/^(\+7|8)9\d{9}$/, "Введите корректный номер телефона.").optional(),
})