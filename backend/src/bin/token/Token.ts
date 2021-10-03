import { z } from 'zod';

export const tokenSchema = z.object({
  createdAt: z.number(),
  expiredAt: z.number(),
  name: z.string(),
  uuid: z.string(),
});

export type Token = z.TypeOf<typeof tokenSchema>;
