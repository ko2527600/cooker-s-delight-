import { getImgUrl } from './image.js';

export function formatImg(url: string, w = 800): string {
  if (!url) return '';
  if (url.startsWith('/assets')) return url;
  if (url.startsWith('/uploads')) return getImgUrl(url) as string;
  if (url.startsWith('http')) return url;
  return `${url}&auto=format&fit=crop&q=80&w=${w}&fm=webp`;
}
