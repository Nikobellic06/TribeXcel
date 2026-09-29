import { API_ORIGIN } from '../api/axios';

export function parseFlexibleDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const dmy = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dmy) {
      const d = new Date(Date.UTC(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1])));
      if (!isNaN(d.getTime())) return d;
    }
    const ymd = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
    if (ymd) {
      const d = new Date(Date.UTC(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3])));
      if (!isNaN(d.getTime())) return d;
    }
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

export function formatDate(value, lang = 'en') {
  if (!value) return '';
  const d = parseFlexibleDate(value);
  if (!d) return String(value);
  return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** yyyy-mm-dd for <input type="date"> */
export function toInputDate(value) {
  if (!value) return '';
  const d = parseFlexibleDate(value);
  if (!d) return '';
  return d.toISOString().slice(0, 10);
}

export function formatINR(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return `₹${n.toLocaleString('en-IN')}`;
}

export function maskAccount(value) {
  const s = String(value || '');
  if (s.length <= 4) return s;
  return `${'X'.repeat(s.length - 4)}${s.slice(-4)}`;
}

/** Whole years of age on a reference date (age limits use 1 July of the selection year). */
export function ageOn(dob, reference) {
  if (!dob) return null;
  const b = parseFlexibleDate(dob);
  const r = parseFlexibleDate(reference);
  if (!b || !r) return null;
  let age = r.getFullYear() - b.getFullYear();
  const m = r.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && r.getDate() < b.getDate())) age -= 1;
  return age;
}

/** Uploaded files are stored on the API server and require authentication. */
export function fileHref(url) {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  const token = typeof window !== 'undefined' ? localStorage.getItem('studentToken') : null;
  const base = `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
  if (token && url.startsWith('/uploads/')) {
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}token=${encodeURIComponent(token)}`;
  }
  return base;
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
