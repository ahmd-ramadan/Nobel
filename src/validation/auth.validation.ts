import { z } from 'zod';
import { UserRolesEnum } from '../enums';

export const loginSchema = z.object({
  username: z
  .string()
  .regex(
      /^[a-z0-9_-]{3,20}$/,
      'Username must be 3-20 characters and can only contain lowercase letters, numbers, underscores, and hyphens'
  )
  .toLowerCase()
  .trim(),
  password: z.string().regex(
    /^(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[A-Za-z]).{8,}$/,
    'Password: 8+ chars, 1 number, 1 special, 1 lowercase or uppercase',
  ),
});

export const logoutSchema = z.object({
  token: z.string().trim(),
});