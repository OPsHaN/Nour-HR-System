import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Output, inject } from '@angular/core';
import {
  getShortcutTheme,
  getShortcutsByRole,
  Shortcut,
  UserRole,
  WindowAction,
} from '../../shortcut.config';
import { Apiservice } from 'src/app/services/api.service';

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
  private readonly api = inject(Apiservice);
  private readonly cdr = inject(ChangeDetectorRef);
  unseenCounts = {
    overtime: 0,
    borrows: 0,
    holidays: 0,
    resignations: 0,
    appointments: 0,
    forgotHours: 0,
  };

  ngOnInit() {
    const role = this.getUserRole();
    this.shortcuts = getShortcutsByRole(role);

      this.loadUnseenCounts();


    this.api.getUnseenComplaintsCount().subscribe({
      next: (response: any) => {
        const count = typeof response === 'number'
          ? response
          : response?.count ?? response?.data ?? response?.total ?? 0;

        this.shortcuts = this.shortcuts.map((shortcut) =>
          shortcut.action === 'complaints'
            ? { ...shortcut, badge: Number(count) || 0 }
            : shortcut,
        );

        this.cdr.detectChanges();
      },
      error: () => {
        this.shortcuts = this.shortcuts.map((shortcut) =>
          shortcut.action === 'complaints' ? { ...shortcut, badge: 0 } : shortcut,
        );
        this.cdr.detectChanges();
      },
    });


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

loadUnseenCounts() {
  this.api.getUnseenOvertimeRequestsCount().subscribe((res: any) => {
    this.unseenCounts.overtime = res.count ?? 0;
    this.updateOrdersBadge();
  });

  this.api.getUnseenBorrowsCount().subscribe((res: any) => {
    this.unseenCounts.borrows = res.count ?? 0;
    this.updateOrdersBadge();
  });

  this.api.getUnseenHolidayRequestsCount().subscribe((res: any) => {
    this.unseenCounts.holidays = res.count ?? 0;
    this.updateOrdersBadge();
  });

  this.api.getUnseenResignationRequestsCount().subscribe((res: any) => {
    this.unseenCounts.resignations = res.count ?? 0;
    this.updateOrdersBadge();
  });

  this.api.getUnseenAppointmentRequestsCount().subscribe((res: any) => {
    this.unseenCounts.appointments = res.count ?? 0;
    this.updateOrdersBadge();
  });

  this.api.getUnseenForgetedHoursRequest().subscribe((res: any) => {
    this.unseenCounts.forgotHours = res.count ?? 0;
    this.updateOrdersBadge();
  });
}

private updateOrdersBadge() {
  const total =
    this.unseenCounts.overtime +
    this.unseenCounts.borrows +
    this.unseenCounts.holidays +
    this.unseenCounts.resignations +
    this.unseenCounts.appointments +
    this.unseenCounts.forgotHours;

  this.shortcuts = this.shortcuts.map((shortcut) =>
    shortcut.action === 'orders'
      ? { ...shortcut, badge: total }
      : shortcut
  );

  this.cdr.detectChanges();
}

}

export { WindowAction };