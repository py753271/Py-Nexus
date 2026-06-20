import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

const applyTheme = (theme) => {
  const root = document.documentElement;
  // CSS variable system (data-theme attribute)
  root.setAttribute('data-theme', theme);
  // Tailwind class-based dark mode
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('py_nexus-theme') || 'light';
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('py_nexus-theme', theme);
  }, [theme]);

  // Apply on mount (before first render the class may be missing)
  useEffect(() => {
    applyTheme(theme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
