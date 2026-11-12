// Copyright (c) 2026 Carlos Felipe. MIT. Original implementation with AI assistance.
import { createHash } from 'node:crypto';
import { z } from 'zod';

export const briefSchema = z.object({
  title: z.string().trim().min(3).max(100),
  brand: z.enum(['Help Mídias', 'Agência Camaleão', 'Radar Disruptivo', 'Radar Jacarepaguá', 'Outro']),
  kind: z.enum(['image', 'video']),
  idea: z.string().trim().min(10).max(3000),
  aspectRatio: z.enum(['9:16', '16:9', '1:1']),
  durationSeconds: z.union([z.literal(0), z.literal(5), z.literal(10)]),
  language: z.literal('pt-BR'),
}).strict();

export const resultSchema = z.object({
  schema: z.literal('radar.creator.brief-preview.v1'),
  mode: z.literal('preview-only'),
  briefHash: z.string().regex(/^[a-f0-9]{64}$/),
  reviewRequired: z.literal(true),
  submissionEnabled: z.literal(false),
  paidGenerationEnabled: z.literal(false),
  productionVerified: z.literal(false),
  studioRequest: z.object({
    title: z.string(), brand: z.string(), model_id: z.string(), prompt: z.string(),
    aspect_ratio: z.string(), duration_seconds: z.number().int(),
    budget_cents: z.literal(0), reference_ids: z.array(z.never()),
  }).strict(),
  productionPlan: z.object({
    language: z.literal('pt-BR'),
    instructions: z.array(z.string()),
    nextStep: z.literal('Revisar o briefing e enviar pelo canal autenticado do estúdio.'),
  }).strict(),
}).strict();

export class BriefError extends Error {
  constructor() { super('INVALID_BRIEF'); this.name = 'BriefError'; }
}

// Hash only binds this local preview. It is not an approval, signature or token.
export function prepareBrief(input: unknown): z.infer<typeof resultSchema> {
  const parsed = briefSchema.safeParse(input);
  if (!parsed.success) throw new BriefError();
  const b = parsed.data;
  if ((b.kind === 'image' && b.durationSeconds !== 0) || (b.kind === 'video' && b.durationSeconds === 0)) {
    throw new BriefError();
  }
  const studioRequest = {
    title: b.title, brand: b.brand,
    model_id: b.kind === 'image' ? 'offline-image-plan-v1' : 'offline-video-plan-v1',
    prompt: b.idea, aspect_ratio: b.aspectRatio, duration_seconds: b.durationSeconds,
    budget_cents: 0 as const, reference_ids: [] as never[],
  };
  const briefHash = createHash('sha256').update(JSON.stringify(studioRequest)).digest('hex');
  return resultSchema.parse({
    schema: 'radar.creator.brief-preview.v1', mode: 'preview-only', briefHash,
    reviewRequired: true, submissionEnabled: false, paidGenerationEnabled: false, productionVerified: false,
    studioRequest,
    productionPlan: { language: b.language, instructions: [
      `Formato ${b.aspectRatio}; ${b.kind === 'image' ? 'imagem estática' : `vídeo de ${b.durationSeconds} segundos`}.`,
      'Usar somente referências próprias ou autorizadas; acrescentar arquivos no estúdio autenticado.',
      'Revisar roteiro, locução em português e direitos antes de qualquer produção ou publicação.',
    ], nextStep: 'Revisar o briefing e enviar pelo canal autenticado do estúdio.' },
  });
}

export const capabilities = Object.freeze({
  schema: 'radar.creator.capabilities.v1', mode: 'preview-only',
  tools: ['creator_capabilities', 'creator_prepare_brief'],
  kinds: ['image', 'video'], aspectRatios: ['9:16', '16:9', '1:1'],
  videoDurationsSeconds: [5, 10], imageDurationSeconds: 0, language: 'pt-BR',
  paidGenerationEnabled: false, submissionEnabled: false, credentialsRequired: false,
  statePersisted: false, openCreatorConnected: false, studioConnected: false,
});
