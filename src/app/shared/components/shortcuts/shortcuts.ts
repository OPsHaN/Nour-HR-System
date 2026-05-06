import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { 
  getShortcutTheme,
  getShortcutsByRole,
  Shortcut,
  WindowAction,
  UserRole
} from '../../shortcut.config';

@Component({
  selector: 'app-shortcuts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shortcuts.html',
  styleUrl: './shortcuts.css',
})
export class ShortcutsComponent {
  @Output() shortcutClick = new EventEmitter<Shortcut>();

  protected shortcuts: Shortcut[] = [];

  ngOnInit() {
    const role = this.getUserRole();
    this.shortcuts = getShortcutsByRole(role);
  }

  protected onShortcutClick(shortcut: Shortcut): void {
    this.shortcutClick.emit(shortcut);
  }

  protected getTheme(action: WindowAction) {
    return getShortcutTheme(action);
  }

  // 👇 جايب role من localStorage
  private getUserRole(): UserRole {
    const role = localStorage.getItem('role');

    const allowed: UserRole[] = ["Admin", "HR", "Accountant", "Employee"];

    return allowed.includes(role as UserRole)
      ? (role as UserRole)
      : "Employee";
  }
}

export { WindowAction };