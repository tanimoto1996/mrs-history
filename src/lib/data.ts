import { getCollection, type CollectionEntry } from 'astro:content';

export type Song = CollectionEntry<'songs'>;

export const url = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;

export async function getSongs() {
  const songs = await getCollection('songs');
  return songs.sort((a, b) => a.data.releaseDate.localeCompare(b.data.releaseDate) || a.data.title.localeCompare(b.data.title, 'ja'));
}

export async function getPhases() {
  const phases = await getCollection('phases');
  return phases.sort((a, b) => a.data.start.localeCompare(b.data.start));
}

export async function getEvents() {
  const events = await getCollection('events');
  return events.sort((a, b) => a.data.date.localeCompare(b.data.date));
}

export const hasBackground = (s: Song) => s.data.status === 'reviewed' && s.data.background.length > 0;

export function formatDate(d: string) {
  const [y, m, day] = d.split('-');
  return [y && `${y}年`, m && `${Number(m)}月`, day && `${Number(day)}日`].filter(Boolean).join('');
}

export function youtubeId(u?: string) {
  if (!u) return undefined;
  const m = u.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m?.[1];
}

export const buildDate = new Date().toISOString().slice(0, 10);
