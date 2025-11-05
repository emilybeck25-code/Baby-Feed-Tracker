import { useEffect, useState } from 'react';

export const THEMES = ['pastel', 'midnight', 'contrast'];
const KEY = 'theme';

function apply(theme) {
  const t = THEMES.includes(theme) ? theme : 'pastel';
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.dataset.theme = t;
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(KEY) || 'pastel';
    } catch {
      return 'pastel';
    }
  });

  useEffect(() => {
    apply(theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* ignore storage failures */
    }
  }, [theme]);

  return { theme, setTheme };
}
