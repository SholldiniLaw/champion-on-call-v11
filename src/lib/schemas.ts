import { z } from 'zod';
export const claimReportSchema = z.object({
  addressLine1: z.string().min(1), city: z.string().min(1), state: z.string().default('FL'),
  zip: z.string().regex(/^\d{5}$/), latitude: z.number(), longitude: z.number(),
  perilType: z.string().min(1), description: z.string().min(10), photoUrls: z.array(z.string()).default([]),
});
export const suggestContractorSchema = z.object({
  name: z.string().min(1), companyName: z.string().min(1), email: z.string().email(),
  phone: z.string().optional(), tradeType: z.enum(['WATER', 'ROOF', 'STRUCTURAL']), coverageAreaText: z.string().optional(),
});
export const checkInSchema = z.object({ latitude: z.number(), longitude: z.number(), demoBypass: z.boolean().optional().default(false) });
export type ClaimReportInput = z.infer<typeof claimReportSchema>;
export type SuggestContractorInput = z.infer<typeof suggestContractorSchema>;
