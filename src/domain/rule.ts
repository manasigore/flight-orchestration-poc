import { z } from "zod";

export const RuleConditionSchema = z.object({
  status: z.string().optional(),
  beforeDepartureMins: z.number().optional(),
});

export const RuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  condition: RuleConditionSchema,
  messageTemplate: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Rule = z.infer<typeof RuleSchema>;
export type RuleCondition = z.infer<typeof RuleConditionSchema>;
