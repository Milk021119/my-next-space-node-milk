"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = 'soymilk_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * 获取初始主题
 * 优先级: localStorage > 系统偏好 > 默认浅色
 */
function getInitialTheme(): Theme {
  // 服务端渲染时返回默认值
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    // 1. 尝试从 localStorage 读取
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    // 2. 检测系统偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // localStorage 不可用时忽略错误
  }

  // 3. 默认浅色主题
  return 'light';
}

/**
 * 更新 document 的 class
 */
function applyThemeToDocument(theme: Theme): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * 持久化主题到 localStorage
 */
function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage 不可用时忽略
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // 初始化：读取存储的主题或系统偏好
  useEffect(() => {
    const initialTheme = getInitialTheme();
    setThemeState(initialTheme);
    applyThemeToDocument(initialTheme);
    setMounted(true);
  }, []);

  // 主题变化时更新 document 和 localStorage
  useEffect(() => {
    if (mounted) {
      applyThemeToDocument(theme);
      persistTheme(theme);
    }
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // 防止服务端渲染闪烁
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// 导出用于测试的工具函数
export { getInitialTheme, applyThemeToDocument, persistTheme, STORAGE_KEY };
export type { Theme, ThemeContextType };
