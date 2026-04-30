import { CommonModule, NgComponentOutlet } from "@angular/common";
import { Component, Input, Output, EventEmitter, Type } from "@angular/core";

import { CalendarComponent } from "../../../components/calendar/calendar.component";
import { BrowserComponent } from "../../../components/browser/browser.component";
import { CreateUser } from "../../../components/create-user/create-user";
import { DownloadComponent } from "../../../components/download/download.component";
import { DesktopWindow } from "../../desktop-window.model";
import { WindowAction, getShortcutTheme } from "../../shortcut.config";
import { HostListener } from "@angular/core";

@Component({
  selector: "app-window",
  standalone: true,
  imports: [
    CommonModule,
    NgComponentOutlet,
    CalendarComponent,
    BrowserComponent,
    CreateUser,
    DownloadComponent,
  ],
  templateUrl: "./window.html",
  styleUrl: "./window.css",
})
export class WindowComponent {
  @Input() window!: DesktopWindow;

  @Output() activate = new EventEmitter<number>();
  @Output() minimize = new EventEmitter<number>();
  @Output() maximize = new EventEmitter<number>();
  @Output() close = new EventEmitter<number>();
@Output() startDrag = new EventEmitter<{ event: MouseEvent; id: number }>();

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
  if (this.resizeState) return; // 🔥 يمنع التعارض
  this.startDrag.emit({ event, id: this.window.id } );
}

  private resizeState?:
    | {
        id: number;
        startX: number;
        startY: number;
        startWidth: number;
        startHeight: number;
        startLeft: number;
      }
    | undefined;

  @HostListener("window:mouseup")
  protected onResizeEnd(): void {
    this.resizeState = undefined;
  }

  @HostListener("window:mousemove", ["$event"])
  protected onResizeMove(event: MouseEvent): void {
    if (!this.resizeState) return;

    const dx = event.clientX - this.resizeState.startX;
    const dy = event.clientY - this.resizeState.startY;

    const newWidth = Math.max(300, this.resizeState.startWidth - dx);
    const newHeight = Math.max(200, this.resizeState.startHeight + dy);
    const newLeft = this.resizeState.startLeft + dx;

    // ⚠️ مهم مع OnPush
    this.window = {
      ...this.window,
      width: newWidth,
      height: newHeight,
      left: newLeft,
    };
  }

  protected onStartResize(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault(); // 🔥 مهم جدًا

    this.resizeState = {
      id: this.window.id,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: this.window.width,
      startHeight: this.window.height,
      startLeft: this.window.left,
    };
  }
  
}
