import { z } from "zod";

export const CreatePipelineValidator = z.object({
  name: z.string().min(1),
  email:z.string(),
});

export type CreatePipelineSchema = z.infer<typeof CreatePipelineValidator>;
