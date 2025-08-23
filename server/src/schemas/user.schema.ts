import { z } from "zod";

const userLoginSchema = z.object({
  secretId: z.string(),
  password: z.string(),
});

export { userLoginSchema };
