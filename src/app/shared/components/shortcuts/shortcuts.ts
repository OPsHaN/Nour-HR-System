import { CommonModule } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
  inject,
} from "@angular/core";
import { interval, Subject } from "rxjs";
import { startWith, takeUntil } from "rxjs/operators";

import {
  getShortcutTheme,
  getShortcutsByRole,
  Shortcut,
  UserRole,
  WindowAction,
} from "../../shortcut.config";
import { Apiservice } from "src/app/services/api.service";
import { AuthService } from "src/app/services/auth.service";
import { UnseenCountsService } from "src/app/services/unseen-counts.service";

@Component({
  selector: "app-shortcuts",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./shortcuts.html",
  styleUrl: "./shortcuts.css",
})
export class ShortcutsComponent {
  @Output() shortcutClick = new EventEmitter<Shortcut>();
  private readonly POLLING_INTERVAL = 50000;
  private destroy$ = new Subject<void>();

  protected shortcuts: Shortcut[] = [];
  private readonly api = inject(Apiservice);
  private readonly cdr = inject(ChangeDetectorRef);
  public readonly auth = inject(AuthService);
  private readonly unseenCountsService = inject(UnseenCountsService);

  ngOnInit() {
    const role = this.getUserRole();
    this.shortcuts = getShortcutsByRole(role);

    if (this.isHR || this.isEmployee || this.auth.isAreaManager) {
      this.unseenCountsService.counts$
        .pipe(takeUntil(this.destroy$))
        .subscribe((counts) => {
          this.updateOrdersBadge(counts);
        });

      interval(this.POLLING_INTERVAL)
        .pipe(startWith(0), takeUntil(this.destroy$))
        .subscribe(() => {
          this.unseenCountsService.refreshAll(this.auth.isHR || this.auth.isEmployee);
          this.loadUnseenComplaint();
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isEmployee(): boolean {
    return localStorage.getItem("role") === "Employee";
  }

  get isHR(): boolean {
    return localStorage.getItem("role") === "HR";
  }

  protected onShortcutClick(shortcut: Shortcut): void {
    this.shortcutClick.emit(shortcut);
  }

  protected getTheme(action: WindowAction) {
    return getShortcutTheme(action);
  }

  // 👇 جايب role من localStorage
  private getUserRole(): UserRole {
    const role = localStorage.getItem("role");

    const allowed: UserRole[] = [
      "Admin",
      "HR",
      "Accountant",
      "Employee",
      "AreaManager",
      "Control",
      "CEO"
    ];

    return allowed.includes(role as UserRole) ? (role as UserRole) : "Employee";
  }

  loadUnseenComplaint() {
    this.api.getUnseenComplaintsCount().subscribe({
      next: (response: any) => {
        const count =
          typeof response === "number"
            ? response
            : (response?.count ?? response?.data ?? response?.total ?? 0);

        this.shortcuts = this.shortcuts.map((shortcut) =>
          shortcut.action === "complaints"
            ? { ...shortcut, badge: Number(count) || 0 }
            : shortcut,
        );

        this.cdr.detectChanges();
      },
      error: () => {
        this.shortcuts = this.shortcuts.map((shortcut) =>
          shortcut.action === "complaints"
            ? { ...shortcut, badge: 0 }
            : shortcut,
        );
        this.cdr.detectChanges();
      },
    });
  }

  private updateOrdersBadge(counts: {
    overtime: number;
    borrows: number;
    holidays: number;
    resignations: number;
    appointments: number;
    forgotHours: number;
  }) {
    let total = counts.overtime;

    if (this.isHR || this.isEmployee) {
      total +=
        counts.borrows +
        counts.holidays +
        counts.resignations +
        counts.appointments +
        counts.forgotHours;
    }

    this.shortcuts = this.shortcuts.map((shortcut) =>
      shortcut.action === "orders" ? { ...shortcut, badge: total } : shortcut,
    );

    this.cdr.detectChanges();
  }
}

export { WindowAction };