import { WindowAction } from '../shortcuts/shortcuts.component';

export interface ShortcutTheme {
  icon: string;
  bg: string;
  color: string;
}

export const SHORTCUT_THEME_MAP: Record<WindowAction, ShortcutTheme> = {
  calendar: {
    icon: 'event',
    bg: '#ff4d4f' ,
    color: '#fff',
  },
  browser: {
    icon: 'groups',
    bg: '#1677ff',
    color: '#fff',
  },
  files: {
    icon: 'schedule',
    bg: '#fa8c16',
    color: '#fff',
  },
  download: {
    icon: 'bar_chart',
    bg: '#52c41a',
    color: '#fff',
  },

  
};