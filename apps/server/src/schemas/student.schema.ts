import { z } from "zod";

const getMaterialsQuerySchema = z.object({
  batch: z.string(),
  subject: z.string(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

export { getMaterialsQuerySchema };
