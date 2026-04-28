import { WindowAction } from "../shortcuts/shortcuts.component";
import { SHORTCUT_THEME_MAP, ShortcutTheme } from "./shortcut-theme";

export function getShortcutTheme(action: WindowAction): ShortcutTheme {
  return SHORTCUT_THEME_MAP[action];
}