import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Apiservice } from 'src/app/services/api.service';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ShiftRecord {
  employeeId: number;
  employeeName: string;
  branchName: string;
  day: string;
  scheduledCheckIn: string;
  actualCheckIn?: string;
  scheduledCheckOut: string;
  actualCheckOut?: string;
}

export interface AbsentRecord {
  employeeId: number;
  employeeName: string;
  branchName: string;
  day: string;
  scheduledCheckIn: string;
  scheduledCheckOut: string;
}

export interface Discount {
  id: number;
  amount: number;
  reasonOfDiscount: string;
  notes: string;
  date: string;
}

export interface Bonus {
  id: number;
  amount: number;
  reason: string;
  date: string;
}

export interface CashBorrow {
  id: number;
  amount: number;
  date: string;
  notes?: string;
}

export interface PayrollDetails {
  discounts: Discount[];
  contractDiscounts: Discount[];
  bonuses: Bonus[];
  cashBorrows: CashBorrow[];
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface Employee {
  id: number;
  name: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    TableModule,
    ButtonModule,
    TagModule,
    MessageModule,
    ProgressSpinnerModule,
    SelectModule,
    DatePickerModule,
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit {

  // ── Tab ─────────────────────────────────────────────────────────────────
  activeTabIndex = 0;

  // ── Shifts Tab ──────────────────────────────────────────────────────────
  shiftsFromDate: Date = new Date();
  allShifts: ShiftRecord[] = [];
  shiftsTotalCount = 0;
  loadingShifts = false;

  // ── Open / Late / Overtime Tab ──────────────────────────────────────────
  selectedShiftType: 'open' | 'late' | 'overtime' = 'open';
  openLateShifts: ShiftRecord[] = [];
  openLateTotalCount = 0;
  loadingOpenLate = false;

  shiftTypeOptions = [
    { label: 'مفتوحة',    value: 'open' },
    { label: 'متأخرة',    value: 'late' },
    { label: 'أوفرتايم',  value: 'overtime' },
  ];

  // ── Absent Tab ──────────────────────────────────────────────────────────
  absentFromDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  absentToDate: Date = new Date();
  absentEmployees: AbsentRecord[] = [];
  absentTotalCount = 0;
  loadingAbsent = false;

  // ── Payroll Tab ─────────────────────────────────────────────────────────
  selectedEmployeeId: number | null = null;
  payrollMonth: Date = new Date();
  payrollDetails: PayrollDetails | null = null;
  loadingPayroll = false;
  employees: Employee[] = [];

  constructor(private attendanceService: Apiservice, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadAllShifts();
    this.loadEmployees();
  }

  // ── Tab Switch ───────────────────────────────────────────────────────────

  onTabChange(index: number): void {
    switch (index) {
      case 0: if (!this.allShifts.length)       this.loadAllShifts();        break;
      case 1: if (!this.openLateShifts.length)  this.loadOpenLateShifts();   break;
      case 2: if (!this.absentEmployees.length)  this.loadAbsentEmployees();  break;
    }
  }

  // ── Loaders ──────────────────────────────────────────────────────────────

  loadAllShifts(): void {
    const fromDate = this.formatDate(this.shiftsFromDate);
    this.loadingShifts = true;
    this.attendanceService.getAllShifts(fromDate).subscribe({
      next: (res: any) => {
        this.allShifts = res.data ?? [];
        this.shiftsTotalCount = res.totalCount ?? 0;
        this.loadingShifts = false;
        this.cdr.detectChanges();
      },
      error: () => (this.loadingShifts = false),
    });
  }

  loadOpenLateShifts(): void {
    this.loadingOpenLate = true;
    this.attendanceService.getAllOpenAndLateShifts(this.selectedShiftType).subscribe({
      next: (res: any) => {
        this.openLateShifts = res.data ?? [];
        this.openLateTotalCount = res.totalCount ?? 0;
        this.loadingOpenLate = false;
        this.cdr.detectChanges();
      },
      error: () => (this.loadingOpenLate = false),
    });
  }

  loadAbsentEmployees(): void {
    const from = this.formatDate(this.absentFromDate);
    const to   = this.formatDate(this.absentToDate);
    this.loadingAbsent = true;
    this.attendanceService.getAbsentEmployees(from, to).subscribe({
      next: (res: any) => {
        this.absentEmployees = res.data ?? [];
        this.absentTotalCount = res.totalCount ?? 0;
        this.loadingAbsent = false;
        this.cdr.detectChanges();
      },
      error: () => (this.loadingAbsent = false),
    });
  }

  loadPayroll(): void {
    if (!this.selectedEmployeeId || !this.payrollMonth) return;
    const month = this.payrollMonth.getMonth() + 1;
    const year  = this.payrollMonth.getFullYear();
    this.loadingPayroll = true;
    this.payrollDetails = null;
    this.attendanceService.getAllReportsForEmpolyeeInMonthAndYear(this.selectedEmployeeId, month, year).subscribe({
      next: (data: any) => {
        this.payrollDetails = data;
        this.loadingPayroll = false;
        this.cdr.detectChanges();
      },
      error: () => (this.loadingPayroll = false),
    });
  }




  loadEmployees() {

    this.attendanceService.getAllEmployees(1, 999).subscribe({
      next: (res: any) => {
        this.employees = res.data;
        this.cdr.detectChanges();
      },

    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** حساب الحالة من الداتا الفعلية */
  getShiftStatus(shift: ShiftRecord): 'present' | 'open' | 'late' {
    if (!shift.actualCheckIn) return 'open';
    const scheduled = shift.scheduledCheckIn?.substring(0, 5);
    const actual    = shift.actualCheckIn?.substring(0, 5);
    return actual > scheduled ? 'late' : 'present';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      present:  'حاضر',
      open:     'مفتوحة',
      late:     'متأخر',
      overtime: 'أوفرتايم',
      absent:   'غائب',
    };
    return map[status] ?? status;
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'info'> = {
      present:  'success',
      open:     'warn',
      late:     'danger',
      overtime: 'info',
      absent:   'danger',
    };
    return map[status] ?? 'info';
  }

  /** إجمالي الخصومات */
  get totalDiscounts(): number {
    if (!this.payrollDetails) return 0;
    const d  = this.payrollDetails.discounts?.reduce((s, x) => s + x.amount, 0) ?? 0;
    const cd = this.payrollDetails.contractDiscounts?.reduce((s, x) => s + x.amount, 0) ?? 0;
    return d + cd;
  }

  /** إجمالي البونص */
  get totalBonuses(): number {
    return this.payrollDetails?.bonuses?.reduce((s, x) => s + x.amount, 0) ?? 0;
  }

  /** إجمالي السلف */
  get totalBorrows(): number {
    return this.payrollDetails?.cashBorrows?.reduce((s, x) => s + x.amount, 0) ?? 0;
  }


  get presentCount(): number {
    return this.allShifts.filter(s => this.getShiftStatus(s) === 'present').length;
  }

  get openCount(): number {
    return this.allShifts.filter(s => this.getShiftStatus(s) === 'open').length;
  }

  get lateCount(): number {
    return this.allShifts.filter(s => this.getShiftStatus(s) === 'late').length;
  }

formatTime(time?: string): string {
  if (!time) return '—';
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minutes = minuteStr?.substring(0, 2) ?? '00';
  const period = hour >= 12 ? 'م' : 'ص';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minutes} ${period}`;
}

  formatDateDisplay(dateStr: string): string {
    if (!dateStr) return '—';
    return dateStr.substring(0, 10);
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}