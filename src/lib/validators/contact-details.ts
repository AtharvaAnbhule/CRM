import { z } from "zod";

export const ContactDetailsValidator = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email(),
  phone:z.string(),
});

export type ContactDetailsSchema = z.infer<typeof ContactDetailsValidator>;
