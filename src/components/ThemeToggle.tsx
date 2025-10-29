'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative w-14 h-14 rounded-xl glass-card flex items-center justify-center group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 opacity-0 dark:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-100 dark:opacity-0 transition-opacity duration-500"></div>
      
      <Sun className="absolute h-6 w-6 text-white rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-6 w-6 text-white rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  );
}