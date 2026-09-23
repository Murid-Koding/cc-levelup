import { z } from 'zod'

const scalarQuery = (schema: z.ZodTypeAny) =>
  z.preprocess((val) => {
    if (Array.isArray(val)) {
      return val[0]
    }
    return val
  }, schema)

export const sessionListQuerySchema = z.object({
  page: scalarQuery(
    z
      .string()
      .regex(/^\d+$/, 'Page harus berupa bilangan bulat positif')
      .transform(Number)
      .pipe(z.number().int().min(1).max(10000))
  ).default('1'),
  limit: scalarQuery(
    z
      .string()
      .regex(/^\d+$/, 'Limit harus berupa bilangan bulat positif')
      .transform(Number)
      .pipe(z.number().int().min(1).max(50))
  ).default('9')
})

export type SessionListQuery = z.infer<typeof sessionListQuerySchema>
