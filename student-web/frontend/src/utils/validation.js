/*
 * Field validators. Each returns an i18n error key (see i18n/strings.js)
 * or null when the value is fine.
 */

export const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';

export const required = (v) => (isBlank(v) ? 'err.required' : null);

export const email = (v) =>
  isBlank(v) ? 'err.required' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()) ? null : 'err.email';

export const mobile = (v) =>
  isBlank(v) ? 'err.required' : /^[6-9]\d{9}$/.test(String(v).trim()) ? null : 'err.mobile';

export const optionalMobile = (v) => (isBlank(v) ? null : mobile(v));

export const pincode = (v) =>
  isBlank(v) ? 'err.required' : /^[1-9]\d{5}$/.test(String(v).trim()) ? null : 'err.pincode';

export const percent = (v) => {
  if (isBlank(v)) return 'err.required';
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? null : 'err.percent';
};

export const amount = (v) => {
  if (isBlank(v)) return 'err.required';
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? null : 'err.amount';
};

export const ifsc = (v) =>
  isBlank(v) ? 'err.required' : /^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(v).trim().toUpperCase()) ? null : 'err.ifsc';

export const accountNumber = (v) =>
  isBlank(v) ? 'err.required' : /^\d{9,18}$/.test(String(v).trim()) ? null : 'err.account';

export const udise = (v) =>
  isBlank(v) ? 'err.required' : /^\d{11}$/.test(String(v).trim()) ? null : 'err.udise';

/* ---------- Aadhaar: 12 digits, not starting with 0/1, valid Verhoeff checksum ---------- */
const D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

export function isValidAadhaar(value) {
  const num = String(value || '').replace(/\s/g, '');
  if (!/^[2-9]\d{11}$/.test(num)) return false;
  let c = 0;
  num
    .split('')
    .reverse()
    .forEach((ch, i) => {
      c = D[c][P[i % 8][Number(ch)]];
    });
  return c === 0;
}

export const aadhaar = (v) => (isBlank(v) ? 'err.required' : isValidAadhaar(v) ? null : 'err.aadhaar');
