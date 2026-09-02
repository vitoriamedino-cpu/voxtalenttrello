import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'icon' | 'pill' | 'button';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'icon', className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  if (variant === 'pill') {
    return (
      <button
        id="theme-toggle-pill"
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`}
        onClick={toggleTheme}
        className={`relative inline-flex h-7 w-14 items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#00A9A1] focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
          isDark ? 'bg-gray-700' : 'bg-gray-200'
        } ${className}`}
      >
        <span className="sr-only">Alternar tema</span>
        <span
          className={`pointer-events-none flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
            isDark ? 'translate-x-7 bg-gray-900 text-amber-400' : 'translate-x-0 bg-white text-gray-700'
          }`}
        >
          {isDark ? (
            <Moon className="h-3.5 w-3.5 text-teal-400 fill-teal-400/20" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-[#F7941D] fill-[#F7941D]/20" />
          )}
        </span>
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        id="theme-toggle-button"
        type="button"
        onClick={toggleTheme}
        aria-label={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 text-xs font-semibold shadow-2xs transition-all ${className}`}
      >
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Modo Claro</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-gray-500" />
            <span>Modo Escuro</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      id="theme-toggle-icon"
      type="button"
      onClick={toggleTheme}
      title={`Alternar para tema ${isDark ? 'claro' : 'escuro'}`}
      aria-label={`Alternar para tema ${isDark ? 'claro' : 'escuro'}`}
      className={`p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all shadow-2xs ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 animate-in fade-in zoom-in duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-gray-600 animate-in fade-in zoom-in duration-200" />
      )}
    </button>
  );
};
