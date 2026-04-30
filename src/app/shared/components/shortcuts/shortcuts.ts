import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { 
  getShortcutTheme,
  getShortcuts,
  Shortcut,
  WindowAction
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

  protected readonly shortcuts = getShortcuts();

  protected onShortcutClick(shortcut: Shortcut): void {
    this.shortcutClick.emit(shortcut);
  }

  protected getTheme(action: WindowAction) {
    return getShortcutTheme(action);
  }
}

export { WindowAction };
