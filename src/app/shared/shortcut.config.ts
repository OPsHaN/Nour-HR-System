export type UserRole = "Admin" | "HR" | "Accountant" | "Control" | "Manager" |"Employee" | "Area Manager";

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
    roles: ["Admin", "HR" , "Accountant" , "Employee"] as UserRole[],
    size: { width: 360, height: 550 },
  },
  users: {
    title: "المستخدمين",
    icon: "groups",
    bg: "#1677ff",
    roles: ["Admin", "HR"] as UserRole[],
    size: { width: 860, height: 600 },
  },
  createUser: {
    title: "إضافة مستخدم",
    icon: "person_add",
    bg: "#fa8c16",
    roles: ["Admin", "HR"] as UserRole[],
    size: { width: 620, height: 480 },
  },
  employees: {
    title: "الموظفين",
    icon: "people",
    bg: "#13c2c2",
    roles: ["Admin", "HR"] as UserRole[],
    size: { width: 860, height: 600 },
  },
  download: {
    title: "التقارير",
    icon: "bar_chart",
    bg: "#52c41a",
    roles: ["Admin", "HR"] as UserRole[],
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
  return CONFIG_KEYS
    .filter((action) => SHORTCUTS_CONFIG[action].roles.includes(role))
    .map((action) => {
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
  const role = localStorage.getItem('role');

  const allowedRoles: UserRole[] = ["Admin", "HR", "Accountant", "Employee"];

  if (role && allowedRoles.includes(role as UserRole)) {
    return role as UserRole;
  }

  // fallback
  return "Employee";
}