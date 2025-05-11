import { z } from "zod";

export const FunnelPageDetailsValidator = z.object({
  name: z.string().min(1),
  pathName: z.string().optional(),
  email:z.string().optional() , 
});

export type FunnelPageDetailsSchema = z.infer<
  typeof FunnelPageDetailsValidator
>;
