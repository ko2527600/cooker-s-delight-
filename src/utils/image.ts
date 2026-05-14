const BASE_URL = import.meta.env.VITE_TI_BASE_URL ?? 'http://localhost:8000';

export function getImgUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/assets')) return path;
  return `${BASE_URL}${path}`;
}

export function formatImg(url: string, w = 800): string {
  if (!url) return '';
  if (url.startsWith('/assets')) return url;
  if (url.startsWith('/uploads')) return getImgUrl(url);
  if (url.startsWith('http')) return url;
  return `${url}&auto=format&fit=crop&q=80&w=${w}&fm=webp`;
}
