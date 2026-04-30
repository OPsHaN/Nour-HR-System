export interface ShortcutTheme {
  icon: string;
  bg: string;
  color: string;
}

export const SHORTCUTS_CONFIG = {
  calendar: {
    title: "النتيجة",
    icon: "event",
    bg: "#ff4d4f",
    size: { width: 360, height: 500 },
  },
  browser: {
    title: "الموظفين",
    icon: "groups",
    bg: "#1677ff",
    size: { width: 860, height: 600 },
  },
  createUser: {
    title: "إضافة موظف",
    icon: "person_add",
    bg: "#fa8c16",
    size: { width: 620, height: 480 },
  },
  download: {
    title: "التقارير",
    icon: "bar_chart",
    bg: "#52c41a",
    size: { width: 620, height: 420 },
  },
} as const;

// 🔥 type بيتولد تلقائي
export type WindowAction = keyof typeof SHORTCUTS_CONFIG;

// 🔥 shape النهائي للـ shortcut
export interface Shortcut {
  action: WindowAction;
  title: string;
  icon: string;
}

// 🔥 generate shortcuts (بدل ما تكتبهم بإيدك)
export function getShortcuts(): Shortcut[] {
  return Object.entries(SHORTCUTS_CONFIG).map(([action, config]) => ({
    action: action as WindowAction,
    title: config.title,
    icon: config.icon,
  }));
}

// 🔥 theme من نفس المصدر
export function getShortcutTheme(action: WindowAction): ShortcutTheme {
  const config = SHORTCUTS_CONFIG[action];

  return {
    icon: config.icon,
    bg: config.bg,
    color: "#fff",
  };
}
