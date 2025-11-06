/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#2563EB'; // Blue-600 - Plus moderne
const tintColorDark = '#60A5FA'; // Blue-400 - Plus lumineux en dark mode

export const Colors = {
  light: {
    text: '#0F172A', // Slate-900 - Plus contrasté
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#64748B', // Slate-500
    tabIconDefault: '#94A3B8', // Slate-400
    tabIconSelected: tintColorLight,
    // Couleurs supplémentaires pour un design moderne
    primary: '#2563EB', // Blue-600
    primaryLight: '#3B82F6', // Blue-500
    secondary: '#10B981', // Emerald-500
    accent: '#8B5CF6', // Violet-500
    warning: '#F59E0B', // Amber-500
    error: '#EF4444', // Red-500
    success: '#10B981', // Emerald-500
    surface: '#F8FAFC', // Slate-50
    surfaceElevated: '#FFFFFF',
    border: '#E2E8F0', // Slate-200
    cardBackground: '#FFFFFF',
    shadow: 'rgba(0, 0, 0, 0.05)',
  },
  dark: {
    text: '#F1F5F9', // Slate-100 - Plus lumineux
    background: '#0F172A', // Slate-900 - Plus profond
    tint: tintColorDark,
    icon: '#94A3B8', // Slate-400
    tabIconDefault: '#64748B', // Slate-500
    tabIconSelected: tintColorDark,
    // Couleurs supplémentaires pour un design moderne
    primary: '#3B82F6', // Blue-500
    primaryLight: '#60A5FA', // Blue-400
    secondary: '#34D399', // Emerald-400
    accent: '#A78BFA', // Violet-400
    warning: '#FBBF24', // Amber-400
    error: '#F87171', // Red-400
    success: '#34D399', // Emerald-400
    surface: '#1E293B', // Slate-800
    surfaceElevated: '#334155', // Slate-700
    border: '#334155', // Slate-700
    cardBackground: '#1E293B', // Slate-800
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
