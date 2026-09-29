import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import strings from './strings';

/*
 * Bilingual (English / Hindi) support for the whole portal.
 *
 *  const { t, tx, lang, toggleLang } = useLang();
 *  t('common.save')                  -> shared strings from ./strings.js
 *  tx({ en: 'Hello', hi: 'नमस्ते' })  -> inline page-specific text
 *
 * The chosen language is remembered in localStorage ('portal_lang'),
 * the same key the landing page already used.
 */

const LanguageContext = createContext(null);
const STORAGE_KEY = 'portal_lang';

function readSavedLang() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'hi' ? 'hi' : 'en';
  } catch {
    return 'en';
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readSavedLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage unavailable (private mode) — language still works for this visit */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = useCallback(() => setLang((l) => (l === 'en' ? 'hi' : 'en')), []);

  const t = useCallback(
    (key, vars) => {
      const entry = strings[key];
      let text = entry ? entry[lang] ?? entry.en : key;
      if (vars) text = text.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? '').toString());
      return text;
    },
    [lang]
  );

  const tx = useCallback(
    (obj) => {
      if (obj == null) return '';
      if (typeof obj === 'string' || typeof obj === 'number') return obj;
      return obj[lang] ?? obj.en ?? '';
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, isHindi: lang === 'hi', t, tx }),
    [lang, toggleLang, t, tx]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLang = () => useContext(LanguageContext);
