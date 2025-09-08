import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
        isDarkMode 
          ? 'bg-blue-600 focus:ring-offset-gray-800' 
          : 'bg-gray-200 focus:ring-offset-white'
      } ${className}`}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <span
        className={`inline-block w-5 h-5 rounded-full bg-white shadow-lg transform transition-transform duration-200 ${
          isDarkMode ? 'translate-x-3' : '-translate-x-3'
        }`}
      >
        {isDarkMode ? (
          <Moon className="w-3 h-3 text-blue-600 m-0.5" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-500 m-0.5" />
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;
