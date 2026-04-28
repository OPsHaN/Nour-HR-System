import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { getShortcutTheme } from '../shared/getShourtcutTheme';

export type WindowAction = 'calendar' | 'browser'  | 'files' | 'download';

export interface Shortcut {
  action: WindowAction;
  title: string;
  icon: string;
  accent?: string;
}

@Component({
  selector: 'app-shortcuts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shortcuts.component.html',
  styleUrl: './shortcuts.component.css',
})
export class ShortcutsComponent {
  @Output() shortcutClick = new EventEmitter<Shortcut>();

  protected readonly shortcuts: Shortcut[] = [
    { action: 'calendar', title: 'النتيجة', icon: 'event', accent: 'blue' },
    { action: 'browser', title: 'الموظفين', icon: 'groups', accent: 'red' },
    { action: 'files', title: 'الشيفتات', icon: 'schedule', accent: 'orange' },
    { action: 'download', title: 'التقارير', icon: 'bar_chart', accent: 'green' },

  ];

  protected onShortcutClick(shortcut: Shortcut): void {
    this.shortcutClick.emit(shortcut);
  }

protected getTheme(action: WindowAction) {
  return getShortcutTheme(action);
}

}
