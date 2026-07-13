import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import { ShortcutsComponent } from "../shortcuts/shortcuts";
import { WindowComponent } from "../window/window";
import { TaskbarComponent } from "../taskbar/taskbar";
import { DesktopWindow } from "../../desktop-window.model";
import { WINDOW_REGISTRY } from "../../window-registry";
import {
  getStartupShortcutsByRole,
  Shortcut,
  SHORTCUTS_CONFIG,
} from "../../shortcut.config";
import { ButtonModule } from "primeng/button";
import { Apiservice } from "src/app/services/api.service";
import { ConfirmationService } from "primeng/api";
import { finalize } from "rxjs/operators";
import { HttpErrorResponse } from "@angular/common/http";
import { UnseenCountsService } from "src/app/services/unseen-counts.service";

@Component({
  selector: "app-desktop",
  standalone: true,
  imports: [
    CommonModule,
    ShortcutsComponent,
    WindowComponent,
    TaskbarComponent,
    ButtonModule,
  ],
  templateUrl: "./desktop.html",
  styleUrl: "./desktop.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Desktop implements OnInit, OnDestroy {
  userName = "";

  // ── Shift State ────────────────────────────────────────────────────────────
  shiftStarted = false;
  loadingStart = false;
  loadingEnd = false;
  formattedTime = "00:00:00";
  private shiftStartTime: Date | null = null;
  private timerInterval: any;
  managerBranches: string[] = [];
  page = 1;
  pageSize = 999;
  loading = false;
  Branches: any[] = [];
  totalUsers = 0;
  totalBranchs = 0;
  unseenCounts = {
    overtime: 0,
    borrows: 0,
    holidays: 0,
    resignations: 0,
    appointments: 0,
    forgotHours: 0,
    complaints: 0,
  };

  get isEmployee(): boolean {
    return localStorage.getItem("role") === "Employee";
  }

  get isHR(): boolean {
    return localStorage.getItem("role") === "HR";
  }

  get isAreaManager(): boolean {
    return localStorage.getItem("role") === "AreaManager";
  }

  get isAdmin(): boolean {
    return localStorage.getItem("role") === "Admin";
  }

  private get storageKey(): string {
    const employeeId = localStorage.getItem("employeeId") ?? "default";
    return `activeShift_${employeeId}`;
  }

  // ── Windows ────────────────────────────────────────────────────────────────
  protected windows: DesktopWindow[] = [];
  protected isDark = false;
  private registry = WINDOW_REGISTRY;
  private readonly cdr = inject(ChangeDetectorRef);
  private dragState?: { id: number; offsetX: number; offsetY: number };
  private nextId = 1;
  private readonly taskbarReserve = 92; // Height of the taskbar

  constructor(
    private api: Apiservice,
    private ngZone: NgZone,
    private confirmationService: ConfirmationService,
    private unseenCountsService: UnseenCountsService,
  ) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem("name") || "مستخدم";
    this.restoreShiftState();
    this.openDefaultStartupWindows();

    if (this.isHR) {
      this.unseenCountsService.counts$.subscribe((counts) => {
        this.unseenCounts = counts;
        this.cdr.detectChanges();
      });

      this.loadUnseenCounts();
    }

    if (this.isAreaManager) {
      this.loadBranches();
    }

    if (this.isAdmin) {
      this.loadUsers();
      this.loadBranches();
    }

    window.addEventListener("open-news-window", () => {
      this.ngZone.run(() => {
        this.openWindow({
          action: "newsdetails",
          title: "تفاصيل الإعلان",
          icon: "article",
        });

        this.cdr.detectChanges();
      });
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }

  loadBranches() {
    this.api.getAllBranches(this.page, this.pageSize).subscribe({
      next: (res: any) => {
        this.Branches = res.data;

        const branchIds = (localStorage.getItem("branchId") || "")
          .split(",")
          .map((id) => +id.trim());

        this.managerBranches = this.Branches.filter((b: any) =>
          branchIds.includes(b.id),
        ).map((b: any) => b.name);

        this.totalBranchs = res.totalCount;

        this.cdr.detectChanges();

        console.log(this.managerBranches);
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadUsers() {
    this.api.getAllUsers(this.page, this.pageSize).subscribe({
      next: (res: any) => {
        this.totalUsers = res.totalCount;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  // ── Shift ──────────────────────────────────────────────────────────────────

  onStartShift(): void {
    this.loadingStart = true;
    this.api
      .startShift()
      .pipe(
        finalize(() => {
          this.loadingStart = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.shiftStarted = true;
          this.shiftStartTime = new Date();
          this.saveShiftState();
          this.startTimer();
          this.api.showSuccess("تم بدء شيفتك بنجاح");
        },
        error: (err: HttpErrorResponse) => {
          const msg =
            err?.error?.message ??
            "يوجد مشكلة فى بدء الشيفت الخاص بك تواصل مع مديرك المباشر";
          this.api.showError(msg);
        },
      });
  }

  onEndShift(): void {
    this.confirmationService.confirm({
      message: "هل تريد إنهاء الشيفت؟",
      header: "تأكيد إنهاء الشيفت",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "نعم",
      rejectLabel: "لا",

      accept: () => {
        this.loadingEnd = true;
        this.api
          .endShift()
          .pipe(
            finalize(() => {
              this.loadingEnd = false;
              this.cdr.detectChanges();
            }),
          )
          .subscribe({
            next: () => {
              this.shiftStarted = false;
              this.shiftStartTime = null;
              this.formattedTime = "00:00:00";

              this.clearShiftState();
              clearInterval(this.timerInterval);

              this.api.showSuccess("تم إنهاء شيفتك بنجاح");
            },
            error: (err: HttpErrorResponse) => {
              const msg =
                err?.error?.message ??
                "يوجد مشكلة فى بدء الشيفت الخاص بك تواصل مع مديرك المباشر";
              this.api.showError(msg);
            },
          });
      },
    });
  }

  private startTimer(): void {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.shiftStartTime) return;
      const diff = Math.floor(
        (Date.now() - this.shiftStartTime.getTime()) / 1000,
      );
      const h = Math.floor(diff / 3600)
        .toString()
        .padStart(2, "0");
      const m = Math.floor((diff % 3600) / 60)
        .toString()
        .padStart(2, "0");
      const s = (diff % 60).toString().padStart(2, "0");
      this.formattedTime = `${h}:${m}:${s}`;
      this.cdr.detectChanges();
    }, 1000);
  }

  private restoreShiftState(): void {
    console.log("EmployeeId", localStorage.getItem("employeeId"));
    console.log("Storage Key", this.storageKey);
    console.log("Saved", localStorage.getItem(this.storageKey));

    const saved = localStorage.getItem(this.storageKey);
    if (!saved) return;
    try {
      const { startTime } = JSON.parse(saved);
      this.shiftStarted = true;
      this.shiftStartTime = new Date(startTime);
      this.startTimer();
    } catch {
      this.clearShiftState();
    }
  }

  private saveShiftState(): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify({ startTime: this.shiftStartTime?.toISOString() }),
    );
  }

  private clearShiftState(): void {
    localStorage.removeItem(this.storageKey);
  }

  // ── Windows ────────────────────────────────────────────────────────────────

  protected openShortcut(shortcut: Shortcut): void {
    this.openWindow(shortcut);
  }

  protected openWebsiteWindow(): void {
    this.openWindow({
      action: "website",
      title: "أوبشن لتطوير البرمجيات",
      icon: "language",
    });
  }

  private openWindow(
    shortcut: Shortcut,
    options?: {
      top?: number;
      left?: number;
      width?: number;
      height?: number;
      active?: boolean;
    },
  ): void {
    const size = this.defaultSize(shortcut.action);
    const baseWindow: DesktopWindow = {
      id: this.nextId++,
      action: shortcut.action,
      component: this.registry[shortcut.action],
      title: shortcut.title,
      icon: shortcut.icon,
      width: options?.width ?? size.width,
      height: options?.height ?? size.height,
      top: options?.top ?? 72 + this.windows.length * 24,
      left: options?.left ?? 120 + this.windows.length * 32,
      minimized: false,
      maximized: false,
      active: options?.active ?? true,
    };

    this.windows = this.windows.map((w) => ({ ...w, active: false }));
    this.windows = [...this.windows, baseWindow];
  }

  private openDefaultStartupWindows(): void {
    const startupShortcuts = getStartupShortcutsByRole(
      this.getUserRole(),
    ).slice(0, 2);

    if (startupShortcuts.length === 0) return;

    const viewportWidth = globalThis.innerWidth || 250;
    const viewportHeight = globalThis.innerHeight || 250;
    const gap = 190;
    const sideWidth = Math.max(100, Math.floor((viewportWidth - gap * 4) / 2));
    const height = Math.min(300, viewportHeight - 140);
    const top = Math.max(12, viewportHeight - 80 - height - 12);

    const [leftShortcut, rightShortcut] = startupShortcuts;

    this.openWindow(leftShortcut, {
      top,
      left: viewportWidth - sideWidth - 10,
      width: sideWidth,
      height,
      active: true,
    });

    if (rightShortcut) {
      this.openWindow(rightShortcut, {
        top,
        left: 10,
        width: sideWidth,
        height,
        active: false,
      });
    }
  }

  private getUserRole(): import("../../shortcut.config").UserRole {
    const role = localStorage.getItem("role") as
      | import("../../shortcut.config").UserRole
      | null;
    return role &&
      [
        "Admin",
        "HR",
        "Accountant",
        "Control",
        "Manager",
        "Employee",
        "Area Manager",
      ].includes(role)
      ? role
      : "Employee";
  }

  protected activateWindow(id: number): void {
    this.windows = this.windows.map((w) => ({
      ...w,
      active: w.id === id,
      minimized: w.id === id ? false : w.minimized,
    }));
  }

  protected minimizeWindow(id: number): void {
    this.windows = this.windows.map((w) =>
      w.id === id ? { ...w, minimized: true, active: false } : w,
    );
  }

  protected closeWindow(id: number): void {
    this.windows = this.windows.filter((w) => w.id !== id);
    const topWindow = [...this.windows].reverse().find((w) => !w.minimized);
    if (topWindow) this.activateWindow(topWindow.id);
  }

  protected toggleMaximize(id: number): void {
    this.windows = this.windows.map((w) => {
      if (w.id !== id) return w;
      if (w.maximized && w.previousRect) {
        return {
          ...w,
          ...w.previousRect,
          maximized: false,
          previousRect: undefined,
          active: true,
          minimized: false,
        };
      }
      return {
        ...w,
        previousRect: {
          top: w.top,
          left: w.left,
          width: w.width,
          height: w.height,
        },
        top: 9,
        left: 10,
        width: Math.max(w.width, globalThis.innerWidth - 20),
        height: globalThis.innerHeight - 100,
        maximized: true,
        active: true,
        minimized: false,
      };
    });
  }

  protected toggleTask(id: number): void {
    const target = this.windows.find((w) => w.id === id);
    if (!target) return;
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
    this.cdr.detectChanges();
  }

  protected startDrag(event: { event: MouseEvent; id: number }): void {
    const { event: mouseEvent, id } = event;
    const target = this.windows.find((w) => w.id === id);
    if (!target || target.maximized) return;
    this.activateWindow(id);
    this.dragState = {
      id,
      offsetX: mouseEvent.clientX - target.left,
      offsetY: mouseEvent.clientY - target.top,
    };
  }

  @HostListener("window:mousemove", ["$event"])
  protected onMouseMove(event: MouseEvent): void {
    if (!this.dragState) return;
    this.windows = this.windows.map((w) => {
      if (w.id !== this.dragState?.id) return w;
      return {
        ...w,
        left: Math.max(
          10,
          Math.min(
            globalThis.innerWidth - w.width - 10,
            event.clientX - this.dragState.offsetX,
          ),
        ),
        top: Math.max(
          10,
          Math.min(
            globalThis.innerHeight - this.taskbarReserve - w.height,
            event.clientY - this.dragState.offsetY,
          ),
        ),
      };
    });
  }

  @HostListener("window:mouseup")
  protected onMouseUp(): void {
    this.dragState = undefined;
  }

  protected trackByWindowId(_: number, w: DesktopWindow): number {
    return w.id;
  }

  private defaultSize(action: keyof typeof SHORTCUTS_CONFIG) {
    return SHORTCUTS_CONFIG[action]?.size ?? { width: 520, height: 360 };
  }

  loadUnseenCounts() {
    this.unseenCountsService.refreshAll();
  }
}
