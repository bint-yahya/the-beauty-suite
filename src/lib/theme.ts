// Accent Color Presets and Dynamic Theme CSS Variable Manager for Glow & Care Suite

export type AccentPresetId = 'soft-pink' | 'lavender' | 'peach';

export interface AccentPreset {
  id: AccentPresetId;
  name: string;
  subtitle: string;
  description: string;
  primaryColor: string;
  previewGradient: string;
  badgeBg: string;
  badgeText: string;
  swatchColors: [string, string, string]; // [50, 500, 700]
  lightVariables: Record<string, string>;
  darkVariables: Record<string, string>;
}

export const ACCENT_PRESETS: Record<AccentPresetId, AccentPreset> = {
  'soft-pink': {
    id: 'soft-pink',
    name: 'Soft Pink',
    subtitle: 'Classic Signature Blush',
    description: 'Delicate rose blush and petal pink for a sweet, timeless aesthetic.',
    primaryColor: '#ec4899',
    previewGradient: 'from-pink-500 via-pink-600 to-fuchsia-500',
    badgeBg: 'bg-pink-100',
    badgeText: 'text-pink-700',
    swatchColors: ['#fdf2f8', '#ec4899', '#be185d'],
    lightVariables: {
      '--color-pink-50': '#fdf2f8',
      '--color-pink-100': '#fce7f3',
      '--color-pink-200': '#fbcfe8',
      '--color-pink-300': '#f9a8d4',
      '--color-pink-400': '#f472b6',
      '--color-pink-500': '#ec4899',
      '--color-pink-600': '#db2777',
      '--color-pink-700': '#be185d',
      '--color-pink-800': '#9d174d',
      '--color-pink-900': '#831843',
      '--color-pink-950': '#500724',
      '--color-fuchsia-500': '#d946ef',
      '--theme-accent-name': '"Soft Pink"',
      '--theme-primary': '#ec4899'
    },
    darkVariables: {
      '--color-pink-50': '#2a1222',
      '--color-pink-100': '#3e1631',
      '--color-pink-200': '#5e1d49',
      '--color-pink-300': '#f472b6',
      '--color-pink-400': '#f472b6',
      '--color-pink-500': '#ec4899',
      '--color-pink-600': '#f472b6',
      '--color-pink-700': '#f9a8d4',
      '--color-pink-800': '#fbcfe8',
      '--color-pink-900': '#fce7f3',
      '--color-pink-950': '#fdf2f8',
      '--color-fuchsia-500': '#e879f9',
      '--theme-accent-name': '"Soft Pink (Dark)"',
      '--theme-primary': '#ec4899'
    }
  },
  'lavender': {
    id: 'lavender',
    name: 'Lavender',
    subtitle: 'Calming Lilac Dream',
    description: 'Soothing pastel purple and gentle lilac for a dreamy, luxurious vibe.',
    primaryColor: '#a855f7',
    previewGradient: 'from-purple-500 via-purple-600 to-violet-500',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    swatchColors: ['#faf5ff', '#a855f7', '#7e22ce'],
    lightVariables: {
      '--color-pink-50': '#faf5ff',
      '--color-pink-100': '#f3e8ff',
      '--color-pink-200': '#e9d5ff',
      '--color-pink-300': '#d8b4fe',
      '--color-pink-400': '#c084fc',
      '--color-pink-500': '#a855f7',
      '--color-pink-600': '#9333ea',
      '--color-pink-700': '#7e22ce',
      '--color-pink-800': '#6b21a8',
      '--color-pink-900': '#581c87',
      '--color-pink-950': '#3b0764',
      '--color-fuchsia-500': '#8b5cf6',
      '--theme-accent-name': '"Lavender"',
      '--theme-primary': '#a855f7'
    },
    darkVariables: {
      '--color-pink-50': '#21102e',
      '--color-pink-100': '#34154a',
      '--color-pink-200': '#501b73',
      '--color-pink-300': '#c084fc',
      '--color-pink-400': '#c084fc',
      '--color-pink-500': '#a855f7',
      '--color-pink-600': '#c084fc',
      '--color-pink-700': '#d8b4fe',
      '--color-pink-800': '#e9d5ff',
      '--color-pink-900': '#f3e8ff',
      '--color-pink-950': '#faf5ff',
      '--color-fuchsia-500': '#a78bfa',
      '--theme-accent-name': '"Lavender (Dark)"',
      '--theme-primary': '#a855f7'
    }
  },
  'peach': {
    id: 'peach',
    name: 'Peach',
    subtitle: 'Sweet Apricot Glow',
    description: 'Warm pastel coral and sweet peach apricot for an energetic, fresh radiance.',
    primaryColor: '#f97316',
    previewGradient: 'from-orange-500 via-orange-600 to-amber-500',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-700',
    swatchColors: ['#fff7ed', '#f97316', '#c2410c'],
    lightVariables: {
      '--color-pink-50': '#fff7ed',
      '--color-pink-100': '#ffedd5',
      '--color-pink-200': '#fed7aa',
      '--color-pink-300': '#fdba74',
      '--color-pink-400': '#fb923c',
      '--color-pink-500': '#f97316',
      '--color-pink-600': '#ea580c',
      '--color-pink-700': '#c2410c',
      '--color-pink-800': '#9a3412',
      '--color-pink-900': '#7c2d12',
      '--color-pink-950': '#431407',
      '--color-fuchsia-500': '#fb923c',
      '--theme-accent-name': '"Peach"',
      '--theme-primary': '#f97316'
    },
    darkVariables: {
      '--color-pink-50': '#2b140b',
      '--color-pink-100': '#3f1a0c',
      '--color-pink-200': '#612610',
      '--color-pink-300': '#fb923c',
      '--color-pink-400': '#fb923c',
      '--color-pink-500': '#f97316',
      '--color-pink-600': '#fb923c',
      '--color-pink-700': '#fdba74',
      '--color-pink-800': '#fed7aa',
      '--color-pink-900': '#ffedd5',
      '--color-pink-950': '#fff7ed',
      '--color-fuchsia-500': '#fb923c',
      '--theme-accent-name': '"Peach (Dark)"',
      '--theme-primary': '#f97316'
    }
  }
};

const LIGHT_NEUTRALS: Record<string, string> = {
  '--color-white': '#ffffff',
  '--color-slate-50': '#f8fafc',
  '--color-slate-100': '#f1f5f9',
  '--color-slate-200': '#e2e8f0',
  '--color-slate-300': '#cbd5e1',
  '--color-slate-400': '#94a3b8',
  '--color-slate-500': '#64748b',
  '--color-slate-600': '#475569',
  '--color-slate-700': '#334155',
  '--color-slate-800': '#1e293b',
  '--color-slate-900': '#0f172a',
  '--color-slate-950': '#020617',
  '--color-emerald-50': '#ecfdf5',
  '--color-emerald-100': '#d1fae5',
  '--color-emerald-600': '#059669',
  '--color-emerald-700': '#047857',
  '--color-amber-50': '#fffbeb',
  '--color-amber-100': '#fef3c7',
  '--color-amber-600': '#d97706',
  '--color-amber-700': '#b45309'
};

const DARK_NEUTRALS: Record<string, string> = {
  '--color-white': '#181820',
  '--color-slate-50': '#0f0e14',
  '--color-slate-100': '#232330',
  '--color-slate-200': '#333344',
  '--color-slate-300': '#4b4b60',
  '--color-slate-400': '#8f8fa3',
  '--color-slate-500': '#abaac0',
  '--color-slate-600': '#cac9dc',
  '--color-slate-700': '#e5e4f2',
  '--color-slate-800': '#f5f5fb',
  '--color-slate-900': '#ffffff',
  '--color-slate-950': '#ffffff',
  '--color-emerald-50': '#062619',
  '--color-emerald-100': '#0d3d29',
  '--color-emerald-600': '#34d399',
  '--color-emerald-700': '#6ee7b7',
  '--color-amber-50': '#291804',
  '--color-amber-100': '#452604',
  '--color-amber-600': '#fbbf24',
  '--color-amber-700': '#fcd34d'
};

const THEME_STORAGE_KEY = 'glow_care_accent_preset_v1';
const DARK_MODE_STORAGE_KEY = 'glow_care_dark_mode_v1';

export function getSavedThemePreset(): AccentPresetId {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as AccentPresetId;
    if (saved && ACCENT_PRESETS[saved]) {
      return saved;
    }
  } catch (e) {
    console.error('Error reading saved theme preset', e);
  }
  return 'soft-pink';
}

export function getSavedDarkMode(): boolean {
  try {
    const saved = localStorage.getItem(DARK_MODE_STORAGE_KEY);
    if (saved !== null) {
      return saved === 'true';
    }
  } catch (e) {
    console.error('Error reading saved dark mode', e);
  }
  return false;
}

export function applyTheme(presetId: AccentPresetId, isDark: boolean): void {
  const preset = ACCENT_PRESETS[presetId] || ACCENT_PRESETS['soft-pink'];
  const root = document.documentElement;

  if (root) {
    // 1. Set mode class and attribute
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    root.setAttribute('data-accent-theme', preset.id);

    // 2. Apply neutral palette variables
    const neutrals = isDark ? DARK_NEUTRALS : LIGHT_NEUTRALS;
    Object.entries(neutrals).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // 3. Apply accent color preset variables
    const accentVars = isDark ? preset.darkVariables : preset.lightVariables;
    Object.entries(accentVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }

  // 4. Persist settings
  try {
    localStorage.setItem(THEME_STORAGE_KEY, presetId);
    localStorage.setItem(DARK_MODE_STORAGE_KEY, String(isDark));
  } catch (e) {
    console.error('Error persisting theme settings', e);
  }
}

// Backward-compatible wrapper
export function applyThemePreset(presetId: AccentPresetId): void {
  const isDark = getSavedDarkMode();
  applyTheme(presetId, isDark);
}
