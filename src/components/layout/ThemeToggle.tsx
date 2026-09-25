'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'day' | 'night';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('night');

  useEffect(() => {
    const currentTheme = document.documentElement.dataset.theme;
    const storedTheme = window.localStorage.getItem('legal-compass-theme');
    const nextTheme: Theme = currentTheme === 'day' || storedTheme === 'day' ? 'day' : 'night';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'night' ? 'day' : 'night';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem('legal-compass-theme', nextTheme);
  };

  const isDay = theme === 'day';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDay ? 'night' : 'day'} theme`}
      aria-pressed={isDay}
      title={`Switch to ${isDay ? 'night' : 'day'} theme`}
      className="theme-toggle inline-flex h-8 w-8 items-center justify-center rounded-lg border border-legal-800 text-legal-300 transition-colors hover:border-amber-500/60 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-legal-950"
    >
      {isDay ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}
