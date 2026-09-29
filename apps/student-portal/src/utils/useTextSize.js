import { useCallback, useEffect, useState } from 'react';

/* Accessibility text-size control (A- / A / A+), remembered across pages. */
const KEY = 'portal_text_scale';
const MIN = 0.9;
const MAX = 1.2;

function readScale() {
  try {
    const n = Number(localStorage.getItem(KEY));
    return n >= MIN && n <= MAX ? n : 1;
  } catch {
    return 1;
  }
}

export default function useTextSize() {
  const [scale, setScale] = useState(readScale);

  useEffect(() => {
    document.documentElement.style.fontSize = `${scale * 100}%`;
    try {
      localStorage.setItem(KEY, String(scale));
    } catch {
      /* ignore */
    }
  }, [scale]);

  const decrease = useCallback(() => setScale((s) => Math.max(MIN, +(s - 0.1).toFixed(2))), []);
  const increase = useCallback(() => setScale((s) => Math.min(MAX, +(s + 0.1).toFixed(2))), []);
  const reset = useCallback(() => setScale(1), []);

  return { scale, decrease, increase, reset };
}
