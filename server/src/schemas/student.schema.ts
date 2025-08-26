import { z } from "zod";

const getMaterialsQuerySchema = z.object({
  batch: z.string(),
  subject: z.string(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

const submitAssignmentSchema = z.object({
  assignmentId: z.string().min(1, "Assignment ID is required"),
  file: z.object({
    public_id: z.string().min(1, "File public ID is required"),
    url: z.string().url("Valid file URL is required"),
  }),
});

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  phoneNumber: z
    .string()
    .length(10, "Phone number must be 10 digits")
    .optional(),
  address: z.string().min(1, "Address is required").optional(),
});

export { getMaterialsQuerySchema, submitAssignmentSchema, updateProfileSchema };
