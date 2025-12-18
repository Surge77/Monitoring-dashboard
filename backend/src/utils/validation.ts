import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const createMetricValueSchema = z.object({
    name: z.string().min(1).max(100),
    value: z.number().finite(),
    timestamp: z.string().datetime().optional(),
    unit: z.string().max(20).optional(),
});

export const createAlertRuleSchema = z.object({
    metricId: z.string().uuid(),
    operator: z.enum(['>', '<', '>=', '<=']),
    threshold: z.number().finite(),
});

export const updateAlertRuleSchema = z.object({
    operator: z.enum(['>', '<', '>=', '<=']).optional(),
    threshold: z.number().finite().optional(),
    isActive: z.boolean().optional(),
});

export const aggregateQuerySchema = z.object({
    range: z.enum(['24h', '7d', '30d']).default('24h'),
    type: z.enum(['avg', 'min', 'max', 'count']).default('avg'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateMetricValueInput = z.infer<typeof createMetricValueSchema>;
export type CreateAlertRuleInput = z.infer<typeof createAlertRuleSchema>;
export type UpdateAlertRuleInput = z.infer<typeof updateAlertRuleSchema>;
export type AggregateQueryInput = z.infer<typeof aggregateQuerySchema>;
