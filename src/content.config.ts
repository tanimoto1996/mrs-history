import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

// YAMLの日付はDateとして読まれるので文字列に戻す
const dateStr = (re: RegExp) =>
  z.preprocess((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : typeof v === 'number' ? String(v) : v), z.string().regex(re));
const ymd = /^\d{4}-\d{2}-\d{2}$/;
const partial = /^\d{4}(-\d{2}(-\d{2})?)?$/;

const source = z.object({
  id: z.string(),
  title: z.string(),
  media: z.string(),
  url: z.string().url(),
  date: dateStr(partial).optional(),
});

const statement = z.object({
  kind: z.enum(['official', 'interpretation', 'secondary']),
  text: z.string(),
  sources: z.array(z.string()).default([]),
  evidence: z.string().optional(),
  basis: z.string().optional(),
});

const songs = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/songs' }),
  schema: z.object({
    title: z.string(),
    releaseDate: dateStr(ymd),
    phase: z.string(),
    works: z.array(z.object({ title: z.string(), type: z.string(), date: dateStr(ymd).optional() })).default([]),
    credits: z.object({ lyrics: z.string().optional(), music: z.string().optional() }).default({}),
    mv: z.string().url().optional(),
    tieups: z.array(z.object({ type: z.string(), work: z.string(), sources: z.array(z.string()).min(1) })).default([]),
    status: z.enum(['basic', 'draft', 'reviewed']),
    reviewedAt: dateStr(ymd).optional(),
    basicSources: z.array(z.string()).min(1),
    background: z.array(statement).default([]),
    sources: z.array(source).min(1),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/events' }),
  schema: z.object({
    date: dateStr(partial),
    title: z.string(),
    kind: z.enum(['live', 'milestone', 'award', 'media', 'release']).default('milestone'),
    description: z.string(),
    phase: z.string(),
    relatedSongs: z.array(z.string()).default([]),
    evidence: z.string().optional(),
    sources: z.array(source).min(1),
  }),
});

const phases = defineCollection({
  loader: file('./src/data/phases.yaml'),
  schema: z.object({
    name: z.string(),
    start: dateStr(partial),
    end: dateStr(partial).optional(),
    summary: z.string(),
    sources: z.array(source).min(1),
  }),
});

export const collections = { songs, events, phases };
