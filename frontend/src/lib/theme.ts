import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type FontScale = 0.9 | 1 | 1.1 | 1.2 | 1.3;

interface ThemeStore {
  theme: Theme;
  fontScale: FontScale;
  setTheme: (theme: Theme) => void;
  setFontScale: (scale: FontScale) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      fontScale: 1,
      
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      
      setFontScale: (scale) => {
        set({ fontScale: scale });
        applyFontScale(scale);
      },
      
      initTheme: () => {
        const { theme, fontScale } = get();
        applyTheme(theme);
        applyFontScale(fontScale);
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.setAttribute('data-theme', systemTheme);
  } else {
    root.setAttribute('data-theme', theme);
  }
}

function applyFontScale(scale: FontScale) {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  root.style.setProperty('--font-scale', scale.toString());
}

// 监听系统主题变化
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const store = useThemeStore.getState();
    if (store.theme === 'system') {
      applyTheme('system');
    }
  });
}
