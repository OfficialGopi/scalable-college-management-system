import { z } from "zod";
import { AdminAccess, BloodGroup, Gender } from "../types/types";

const superAdminLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
  secretKey: z.string(),
});

const superAdminAuthenticationHeaderSchema = z.object({
  Authorization: z.string(),
});

const createAdminSchema = z.object({
  name: z.string(),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(Object.values(Gender)),
  phoneNumber: z.string().length(10),
  address: z.string(),
  bloodGroup: z.enum(Object.values(BloodGroup)),
  adminAccess: z.array(z.enum(Object.values(AdminAccess))).default([]),
});

const updateAdminSchema = z.object({
  name: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(Object.values(Gender)).optional(),
  phoneNumber: z.string().length(10).optional(),
  address: z.string().optional(),
  bloodGroup: z.enum(Object.values(BloodGroup)).optional(),
  adminAccess: z.array(z.enum(Object.values(AdminAccess))).optional(),
});

const adminIdSchema = z.object({
  adminId: z.string(),
});

export {
  superAdminLoginSchema,
  superAdminAuthenticationHeaderSchema,
  createAdminSchema,
  updateAdminSchema,
  adminIdSchema,
};
