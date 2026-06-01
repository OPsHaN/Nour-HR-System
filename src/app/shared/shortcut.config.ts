export type UserRole =
  | "Admin"
  | "HR"
  | "Accountant"
  | "Control"
  | "Manager"
  | "Employee"
  | "Area Manager";

export interface ShortcutTheme {
  icon: string;
  bg: string;
  color: string;
}

type ShortcutConfig = {
  title: string;
  icon: string;
  bg: string;
  roles: UserRole[];
  size: { width: number; height: number };
};

/* 🔥 CONFIG */
export const SHORTCUTS_CONFIG = {
  calendar: {
    title: "النتيجة",
    icon: "event",
    bg: "#ff4d4f",
    roles: ["Admin", "HR", "Accountant", "Employee", "Area Manager" , "Control"] as UserRole[],
    size: { width: 500, height: 650 },
  },
  users: {
    title: "المستخدمين",
    icon: "groups",
    bg: "#1677ff",
    roles: ["Admin", "HR"] as UserRole[],
    size: { width: 900, height: 600 },
  },
  employees: {
    title: "الموظفين",
    icon: "people",
    bg: "#13c2c2",
    roles: ["Admin", "HR"] as UserRole[],
    size: { width: 1250, height: 600 },
  },
  branches: {
    title: "الفروع",
    icon: "apartment",
    bg: "#fa8c16",
    roles: ["Admin", "HR"] as UserRole[],
    size: { width: 620, height: 480 },
  },
  criteria: {
    title: "بنود التقييم",
    icon: "check_circle",
    bg: "#722ed1",
    roles: ["Admin", "HR" , "Employee"] as UserRole[],
    size: { width: 620, height: 480 },
  },
  banks: {
    title: "البنوك",
    icon: "account_balance",
    bg: "#eb2f96",
    roles: ["Admin", "HR" , "Area Manager"] as UserRole[],
    size: { width: 620, height: 480 },
  },
  reports: {
    title: "التقارير ",
    icon: "bar_chart",
    bg: "#52c41a",
    roles: ["Admin", "HR" , "Control" , "Area Manager" ] as UserRole[],
    size: { width: 1100, height: 500 },
  },
  responsibility: {
    title: "العهدة",
    icon: "work",
    bg: "#fa541c",
    roles: ["Admin", "HR" , "Employee"] as UserRole[],
    size: { width: 1100, height: 500 },
  },

  orders: {
    title: "الطلبات",
    icon: "assignment",
    bg: "#fa8c16",
    roles: ["Admin", "HR" , "Employee"] as UserRole[],
    size: { width: 620, height: 420 },
  },
  complaints: {
    title: "الشكاوى",
    icon: "report_problem",
    bg: "#f5222d",
    roles: ["Admin", "HR" , "Employee"] as UserRole[],
    size: { width: 620, height: 420 },
  },
} satisfies Record<string, ShortcutConfig>;

/* 🔥 TYPES */
export type WindowAction = keyof typeof SHORTCUTS_CONFIG;

export interface Shortcut {
  action: WindowAction;
  title: string;
  icon: string;
}

const CONFIG_KEYS = Object.keys(SHORTCUTS_CONFIG) as WindowAction[];

/* 🔥 ALL SHORTCUTS */
export function getShortcuts(): Shortcut[] {
  return CONFIG_KEYS.map((action) => {
    const config = SHORTCUTS_CONFIG[action];

    return {
      action,
      title: config.title,
      icon: config.icon,
    };
  });
}

/* 🔥 ROLE FILTER */
export function getShortcutsByRole(role: UserRole): Shortcut[] {
  return CONFIG_KEYS.filter((action) =>
    SHORTCUTS_CONFIG[action].roles.includes(role),
  ).map((action) => {
    const config = SHORTCUTS_CONFIG[action];

    return {
      action,
      title: config.title,
      icon: config.icon,
    };
  });
}

/* 🔥 THEME */
export function getShortcutTheme(action: WindowAction): ShortcutTheme {
  const config = SHORTCUTS_CONFIG[action];

  return {
    icon: config.icon,
    bg: config.bg,
    color: "#fff",
  };
}

//get role from localstorge with fallback
export function getUserRole(): UserRole {
  const role = localStorage.getItem("role");

  const allowedRoles: UserRole[] = ["Admin", "HR", "Accountant", "Employee"];

  if (role && allowedRoles.includes(role as UserRole)) {
    return role as UserRole;
  }

  // fallback
  return "Employee";
}
