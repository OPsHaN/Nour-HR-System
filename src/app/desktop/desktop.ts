import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  inject,
} from "@angular/core";
import {
  ShortcutsComponent,
  type Shortcut,
  type WindowAction,
} from "../shortcuts/shortcuts.component";
import { WindowComponent } from "../window/window.component";
import { TaskbarComponent } from "../taskbar/taskbar.component";
import { DesktopWindow } from "../shared/desktop-window.model";
import { WINDOW_REGISTRY } from "../shared/window-registry";

@Component({
  selector: "app-desktop",
  standalone: true,
  imports: [
    CommonModule,
    ShortcutsComponent,
    WindowComponent,
    TaskbarComponent,
  ],
  templateUrl: "./desktop.html",
  styleUrl: "./desktop.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Desktop implements OnDestroy {
  userName: string = '';

  protected windows: DesktopWindow[] = [];
  protected isDark = false;
  private registry = WINDOW_REGISTRY;
  private readonly cdr = inject(ChangeDetectorRef);
  private dragState?:
    | {
        id: number;
        offsetX: number;
        offsetY: number;
      }
    | undefined;
  private nextId = 1;
  

  ngOnInit() {
  this.userName = localStorage.getItem('name') || 'مستخدم';
}

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  protected openShortcut(shortcut: Shortcut): void {
    const baseWindow: DesktopWindow = {
      id: this.nextId++,
      action: shortcut.action,
      component: this.registry[shortcut.action],
      title: shortcut.title,
      icon: shortcut.icon,
      width: this.defaultSize(shortcut.action).width,
      height: this.defaultSize(shortcut.action).height,
      top: 72 + this.windows.length * 24,
      left: 120 + this.windows.length * 32,
      minimized: false,
      maximized: false,
      active: true,
    };

    this.windows = this.windows.map((window) => ({ ...window, active: false }));
    this.windows = [...this.windows, baseWindow];
  }

  protected activateWindow(id: number): void {
    this.windows = this.windows.map((window) => ({
      ...window,
      active: window.id === id,
      minimized: window.id === id ? false : window.minimized,
    }));
  }

  protected minimizeWindow(id: number): void {
    this.windows = this.windows.map((window) =>
      window.id === id ? { ...window, minimized: true, active: false } : window,
    );
  }

  protected closeWindow(id: number): void {
    this.windows = this.windows.filter((window) => window.id !== id);
    const topWindow = [...this.windows]
      .reverse()
      .find((window) => !window.minimized);
    if (topWindow) {
      this.activateWindow(topWindow.id);
    }
  }

  protected toggleMaximize(id: number): void {
    this.windows = this.windows.map((window) => {
      if (window.id !== id) {
        return window;
      }

      if (window.maximized && window.previousRect) {
        return {
          ...window,
          ...window.previousRect,
          maximized: false,
          previousRect: undefined,
          active: true,
          minimized: false,
        };
      }

      return {
        ...window,
        previousRect: {
          top: window.top,
          left: window.left,
          width: window.width,
          height: window.height,
        },
        top: 10,
        left: 10,
        width: Math.max(window.width, globalThis.innerWidth - 20),
        height: globalThis.innerHeight - 100,
        maximized: true,
        active: true,
        minimized: false,
      };
    });
  }

  protected toggleTask(id: number): void {
    const target = this.windows.find((window) => window.id === id);
    if (!target) {
      return;
    }

    if (target.minimized) {
      this.activateWindow(id);
      return;
    }

    if (target.active) {
      this.minimizeWindow(id);
      return;
    }

    this.activateWindow(id);
  }

  protected handleThemeChange(isDark: boolean): void {
    this.isDark = isDark;
    this.cdr.markForCheck();
  }

  protected startDrag(event: MouseEvent, id: number): void {
    const target = this.windows.find((window) => window.id === id);
    if (!target || target.maximized) {
      return;
    }

    this.activateWindow(id);
    this.dragState = {
      id,
      offsetX: event.clientX - target.left,
      offsetY: event.clientY - target.top,
    };
  }

  @HostListener("window:mousemove", ["$event"])
  protected onMouseMove(event: MouseEvent): void {
    if (!this.dragState) {
      return;
    }

    this.windows = this.windows.map((window) => {
      if (window.id !== this.dragState?.id) {
        return window;
      }

      const nextLeft = Math.max(
        16,
        Math.min(
          globalThis.innerWidth - window.width - 16,
          event.clientX - this.dragState.offsetX,
        ),
      );
      const nextTop = Math.max(
        16,
        Math.min(
          globalThis.innerHeight - 120,
          event.clientY - this.dragState.offsetY,
        ),
      );
      return {
        ...window,
        left: nextLeft,
        top: nextTop,
      };
    });
  }

  @HostListener("window:mouseup")
  protected onMouseUp(): void {
    this.dragState = undefined;
  }

  protected trackByWindowId(_: number, window: DesktopWindow): number {
    return window.id;
  }

  private sizeConfig: Record<string, { width: number; height: number }> = {
    browser: { width: 860, height: 600 },
    download: { width: 620, height: 420 },
    calendar: { width: 360, height: 500 },
    files: { width: 520, height: 360 },
  };

  private defaultSize(action: string) {
    return this.sizeConfig[action] ?? { width: 520, height: 360 };
  }
}
