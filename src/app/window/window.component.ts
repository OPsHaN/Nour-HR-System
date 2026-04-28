import { CommonModule, NgComponentOutlet } from "@angular/common";
import { Component, Input, Output, EventEmitter, Type } from "@angular/core";

import { CalendarComponent } from "../calendar/calendar.component";
import { BrowserComponent } from "../browser/browser.component";
import { FilesComponent } from "../files/files.component";
import { DownloadComponent } from "../download/download.component";
import { DesktopWindow } from "../shared/desktop-window.model";
import { WindowAction } from "../shortcuts/shortcuts.component";
import { getShortcutTheme } from "../shared/getShourtcutTheme";

@Component({
  selector: "app-window",
  standalone: true,
  imports: [
    CommonModule,
    NgComponentOutlet,
    CalendarComponent,
    BrowserComponent,
    FilesComponent,
    DownloadComponent
  ],
  templateUrl: "./window.component.html",
  styleUrl: "./window.component.css",
})
export class WindowComponent {
  @Input() window!: DesktopWindow;

  @Output() activate = new EventEmitter<number>();
  @Output() minimize = new EventEmitter<number>();
  @Output() maximize = new EventEmitter<number>();
  @Output() close = new EventEmitter<number>();
  @Output() startDrag = new EventEmitter<MouseEvent>();

  protected onActivate(): void {
    this.activate.emit(this.window.id);
  }

    protected getTheme(action: WindowAction) {
    return getShortcutTheme(action);
  }
  

  protected onMinimize(): void {
    this.minimize.emit(this.window.id);
  }

  protected onMaximize(): void {
    this.maximize.emit(this.window.id);
  }

  protected onClose(): void {
    this.close.emit(this.window.id);
  }

  protected onStartDrag(event: MouseEvent): void {
    this.startDrag.emit(event);
  }
}