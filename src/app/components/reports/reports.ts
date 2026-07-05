import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DatePickerModule } from "primeng/datepicker";
import { SelectModule } from "primeng/select";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { MessageModule } from "primeng/message";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "primeng/tabs";
import { Apiservice } from "src/app/services/api.service";
import { AuthService } from "src/app/services/auth.service";
import { forkJoin } from "rxjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

export interface MonthlyPayrollRecord {
  employeeId: number;
  employeeName: string;
  branchId: number;
  branchName: string;
  month: number;
  year: number;
  target: number;
  insurence: number;
  hours: number;
  hoursOverTime: number;
  forgetedHours: number;
  holidayHours: number;
  totalSalary: number;
  totalDiscounts: number;
  totalContractDiscount: number;
  totalBouns: number;
  totalBorrows: number;
  totalCashBorrows: number;
  netSalary: number;
  bankName?: string;
  bankAccount?: string;
}

export interface Branch {
  id: string;
  name: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: "app-reports",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    TableModule,
    ButtonModule,
    TagModule,
    MessageModule,
    ProgressSpinnerModule,
    SelectModule,
    DatePickerModule,
  ],
  templateUrl: "./reports.html",
  styleUrl: "./reports.css",
})
export class Reports implements OnInit {
  // ── Tab ─────────────────────────────────────────────────────────────────
  activeTabIndex = 0;

  // ── Shifts Tab ──────────────────────────────────────────────────────────
  shiftsFromDate: Date = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );
  shiftsToDate: Date = new Date();
  allShifts: ShiftRecord[] = [];
  shiftsTotalCount = 0;
  loadingShifts = false;
  shiftsPage = 1;
  shiftsPageSize = 10;

  // ── Open / Late / Overtime Tab ──────────────────────────────────────────
  selectedShiftType: "open" | "late" | "overtime" = "open";
  openLateShifts: ShiftRecord[] = [];
  openLateTotalCount = 0;
  loadingOpenLate = false;
  openLatePage = 1;
  openLatePageSize = 10;

  shiftTypeOptions = [
    { label: "مفتوحة", value: "open" },
    { label: "متأخرة", value: "late" },
    // { label: "أوفرتايم", value: "overtime" },
  ];

  // ── Absent Tab ──────────────────────────────────────────────────────────
  absentFromDate: Date = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );
  absentToDate: Date = new Date();
  absentEmployees: AbsentRecord[] = [];
  absentTotalCount = 0;
  loadingAbsent = false;
  absentPage = 1;
  absentPageSize = 10;

  // ── Payroll Tab ─────────────────────────────────────────────────────────
  selectedEmployeeId: number | null = null;
  payrollMonth: Date = new Date();
  payrollDetails: PayrollDetails | null = null;
  loadingPayroll = false;
  employees: Employee[] = [];

  // ── Monthly Payroll Tab ─────────────────────────────────────────────────
  monthlyPayrollMonth: Date = new Date();
  monthlyPayrollData: MonthlyPayrollRecord[] = [];
  loadingMonthlyPayroll = false;
  monthlyPayrollPage = 1;
  monthlyPayrollPageSize = 10;
  monthlyPayrollTotalCount = 0;
  monthlyPayrollFirst = 1;
  // ── Branch Payroll Tab ──────────────────────────────────────────────────
  branchPayrollMonth: Date = new Date();
  selectedBranchId: string | null = null;
  branchPayrollData: MonthlyPayrollRecord[] = [];
  loadingBranchPayroll = false;
  branchPayrollPage = 1;
  branchPayrollPageSize = 10;
  branchPayrollTotalCount = 0;
branchPayrollFirst = 1
  branches: Branch[] = [];

  constructor(
    private api: Apiservice,
    private cdr: ChangeDetectorRef,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    if (this.auth.isAdmin || this.auth.isHR || this.auth.isControl) {
      this.loadAllShifts();
      this.loadEmployees();
      this.loadBranches();
    }

    if (this.auth.isAccountant) {
      this.loadMonthlyPayroll();
      this.loadBranches();
      this.activeTabIndex = 4;
    }
  }

  // ── Tab Switch ───────────────────────────────────────────────────────────

  onTabChange(index: number): void {
    switch (index) {
      case 0:
        if (!this.allShifts.length) this.loadAllShifts();
        break;
      case 1:
        if (!this.openLateShifts.length) this.loadOpenLateShifts();
        break;
      case 2:
        if (!this.absentEmployees.length) this.loadAbsentEmployees();
        break;
      case 4:
        if (!this.monthlyPayrollData.length) this.loadMonthlyPayroll();
        break;
    }
  }

  get isAccountant(): boolean {
    return localStorage.getItem("role") === "Accountant";
  }

  get isControl(): boolean {
    return localStorage.getItem("role") === "Control";
  }

  // ── Page Change Handlers ─────────────────────────────────────────────────

  onShiftsPageChange(event: any): void {
    this.shiftsPage = event.first / event.rows + 1;
    this.shiftsPageSize = event.rows;
    this.loadAllShifts();
  }

  onOpenLatePageChange(event: any): void {
    this.openLatePage = event.first / event.rows + 1;
    this.openLatePageSize = event.rows;
    this.loadOpenLateShifts();
  }

  onAbsentPageChange(event: any): void {
    this.absentPage = event.first / event.rows + 1;
    this.absentPageSize = event.rows;
    this.loadAbsentEmployees();
  }

  onMonthlyPayrollPageChange(event: any): void {
    if (event.rows !== this.monthlyPayrollPageSize) {
      this.monthlyPayrollFirst = 0;
      this.monthlyPayrollPage = 1;
    } else {
      this.monthlyPayrollFirst = event.first;
      this.monthlyPayrollPage = event.first / event.rows + 1;
    }
    this.monthlyPayrollPageSize = event.rows;
    this.loadMonthlyPayroll();
        this.cdr.detectChanges();

  }

  onBranchPayrollPageChange(event: any): void {
        if (event.rows !== this.branchPayrollPageSize) {
      this.branchPayrollFirst = 0;
      this.branchPayrollPage = 1;
    } else {
      this.branchPayrollFirst = event.first;
      this.branchPayrollPage = event.first / event.rows + 1;
    }
    this.branchPayrollPage = event.first / event.rows + 1;
    this.branchPayrollPageSize = event.rows;
    this.loadBranchPayroll();
        this.cdr.detectChanges();

  }

  // ── Loaders ──────────────────────────────────────────────────────────────

  applyShiftsFilter(): void {
    this.shiftsPage = 1;
    this.loadAllShifts();
    this.cdr.detectChanges();
  }

  loadAllShifts(): void {
    const fromDate = this.formatDate(this.shiftsFromDate);
    const toDate = this.formatDate(this.shiftsToDate);
    this.loadingShifts = true;
    this.api
      .getAllShifts(
        fromDate,
        toDate,
        this.shiftsPage,
        this.shiftsPageSize,
        this.selectedEmployeeId ?? undefined,
        this.selectedBranchId ?? undefined,
      )
      .subscribe({
        next: (res: any) => {
          this.allShifts = res.data ?? [];
          this.shiftsTotalCount = res.totalCount ?? 0;
          this.loadingShifts = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loadingShifts = false;
          this.cdr.detectChanges();
          this.api.showError("فشل تحميل البيانات");
        },
      });
  }

  applyOpenLateFilter(): void {
    this.openLatePage = 1;
    this.loadOpenLateShifts();
    this.cdr.detectChanges();
  }

  loadOpenLateShifts(): void {
    const fromDate = this.formatDate(this.shiftsFromDate);
    const toDate = this.formatDate(this.shiftsToDate);
    this.loadingOpenLate = true;
    this.api
      .getAllOpenAndLateShifts(
        fromDate,
        toDate,
        this.selectedShiftType,
        this.openLatePage,
        this.openLatePageSize,
        this.selectedEmployeeId ?? undefined,
        this.selectedBranchId ?? undefined,
      )
      .subscribe({
        next: (res: any) => {
          this.openLateShifts = res.data ?? [];
          this.openLateTotalCount = res.totalCount ?? 0;
          this.loadingOpenLate = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loadingOpenLate = false;
          this.cdr.detectChanges();
          this.api.showError("فشل تحميل البيانات");
        },
      });
  }

  applyAbsentFilter(): void {
    this.absentPage = 1;
    this.loadAbsentEmployees();
    this.cdr.detectChanges();
  }

  loadAbsentEmployees(): void {
    const from = this.formatDate(this.absentFromDate);
    const to = this.formatDate(this.absentToDate);
    this.loadingAbsent = true;
    this.api
      .getAbsentEmployees(
        from,
        to,
        this.absentPage,
        this.absentPageSize,
        this.selectedEmployeeId ?? undefined,
        this.selectedBranchId ?? undefined,
      )
      .subscribe({
        next: (res: any) => {
          this.absentEmployees = res.data;
          this.absentTotalCount = res.totalCount;
          this.loadingAbsent = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loadingAbsent = false;
          this.cdr.detectChanges();
          this.api.showError("فشل تحميل البيانات");
        },
      });
  }

  loadPayroll(): void {
    if (!this.selectedEmployeeId || !this.payrollMonth) return;
    const month = this.payrollMonth.getMonth() + 1;
    const year = this.payrollMonth.getFullYear();
    this.loadingPayroll = true;
    this.payrollDetails = null;
    this.api
      .getAllReportsForEmpolyeeInMonthAndYear(
        this.selectedEmployeeId,
        month,
        year,
      )
      .subscribe({
        next: (data: any) => {
          this.payrollDetails = data;
          this.loadingPayroll = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loadingPayroll = false;
          this.cdr.detectChanges();
          this.api.showError("فشل تحميل البيانات");
        },
      });
  }

  applyMonthlyPayrollFilter(): void {
    this.monthlyPayrollPage = 1;
    this.loadMonthlyPayroll();
    this.cdr.detectChanges();
  }

  loadMonthlyPayroll(): void {
    if (!this.monthlyPayrollMonth) return;
    const month = this.monthlyPayrollMonth.getMonth() + 1;
    const year = this.monthlyPayrollMonth.getFullYear();
    this.loadingMonthlyPayroll = true;
    this.monthlyPayrollData = [];
    this.api
      .getAllMonthlyData(
        month,
        year,
        this.monthlyPayrollPage,
        this.monthlyPayrollPageSize,
      )
      .subscribe({
        next: (res: any) => {
          this.monthlyPayrollData = res.data ?? res ?? [];
          this.monthlyPayrollTotalCount = res.totalCount ?? 0;
          this.loadingMonthlyPayroll = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loadingMonthlyPayroll = false;
          this.cdr.detectChanges();
          this.api.showError("فشل تحميل البيانات");
        },
      });
  }

  applyBranchPayrollFilter(): void {
    this.branchPayrollPage = 1;
    this.loadBranchPayroll();
    this.cdr.detectChanges();
  }

  loadBranchPayroll(): void {
    if (!this.selectedBranchId || !this.branchPayrollMonth) return;
    const month = this.branchPayrollMonth.getMonth() + 1;
    const year = this.branchPayrollMonth.getFullYear();
    this.loadingBranchPayroll = true;
    this.branchPayrollData = [];
    this.api
      .getAllMonthlyDatabyBranch(
        month,
        year,
        this.selectedBranchId,
        this.branchPayrollPage,
        this.branchPayrollPageSize,
      )
      .subscribe({
        next: (res: any) => {
          this.branchPayrollData = res.data ?? res ?? [];
          this.branchPayrollTotalCount = res.totalCount ?? 0;
          this.loadingBranchPayroll = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loadingBranchPayroll = false;
          this.cdr.detectChanges();
          this.api.showError("فشل تحميل البيانات");
        },
      });
  }

  loadBranches(): void {
    this.api.getAllBranches(1, 999).subscribe({
      next: (res: any) => {
        this.branches = res.data ?? res ?? [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.branches = [];
        this.cdr.detectChanges();
        this.api.showError("فشل تحميل البيانات");
      },
    });
  }

  loadEmployees(): void {
    this.api.getAllEmployees(1, 999).subscribe({
      next: (res: any) => {
        this.employees = res.data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.employees = [];
        this.cdr.detectChanges();
        this.api.showError("فشل تحميل البيانات");
      },
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  getShiftStatus(shift: ShiftRecord): "present" | "open" | "late" {
    if (!shift.actualCheckIn) return "open";
    const scheduled = shift.scheduledCheckIn?.substring(0, 5);
    const actual = shift.actualCheckIn?.substring(0, 5);
    return actual > scheduled ? "late" : "present";
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      present: "حاضر",
      open: "مفتوحة",
      late: "متأخر",
      overtime: "أوفرتايم",
      absent: "غائب",
    };
    return map[status] ?? status;
  }

  getStatusSeverity(status: string): "success" | "warn" | "danger" | "info" {
    const map: Record<string, "success" | "warn" | "danger" | "info"> = {
      present: "success",
      open: "warn",
      late: "danger",
      overtime: "info",
      absent: "danger",
    };
    return map[status] ?? "info";
  }

  get totalDiscounts(): number {
    if (!this.payrollDetails) return 0;
    const d =
      this.payrollDetails.discounts?.reduce((s, x) => s + x.amount, 0) ?? 0;
    const cd =
      this.payrollDetails.contractDiscounts?.reduce(
        (s, x) => s + x.amount,
        0,
      ) ?? 0;
    return d + cd;
  }

  get totalBonuses(): number {
    return this.payrollDetails?.bonuses?.reduce((s, x) => s + x.amount, 0) ?? 0;
  }

  get totalBorrows(): number {
    return (
      this.payrollDetails?.cashBorrows?.reduce((s, x) => s + x.amount, 0) ?? 0
    );
  }

  get presentCount(): number {
    return this.allShifts.filter((s) => this.getShiftStatus(s) === "present")
      .length;
  }

  get openCount(): number {
    return this.allShifts.filter((s) => this.getShiftStatus(s) === "open")
      .length;
  }

  get lateCount(): number {
    return this.allShifts.filter((s) => this.getShiftStatus(s) === "late")
      .length;
  }

  get monthlyTotalSalary(): number {
    return this.monthlyPayrollData.reduce((s, x) => s + x.totalSalary, 0);
  }

  getTotalHours(row: MonthlyPayrollRecord): number {
    return (
      (row.hours ?? 0) +
      (row.hoursOverTime ?? 0) +
      (row.forgetedHours ?? 0) +
      (row.holidayHours ?? 0)
    );
  }

  get monthlyTotalDiscountsOnly(): number {
    return this.monthlyPayrollData.reduce((s, x) => s + x.totalDiscounts, 0);
  }
  get monthlyTotalDiscounts(): number {
    return this.monthlyPayrollData.reduce(
      (s, x) => s + x.totalDiscounts + x.totalContractDiscount,
      0,
    );
  }
  get monthlyTotalBonuses(): number {
    return this.monthlyPayrollData.reduce((s, x) => s + x.totalBouns, 0);
  }
  get monthlyTotalBorrows(): number {
    return this.monthlyPayrollData.reduce(
      (s, x) => s + x.totalBorrows + x.totalCashBorrows,
      0,
    );
  }
  get monthlyTotalNet(): number {
    return this.monthlyPayrollData.reduce((s, x) => s + x.netSalary, 0);
  }

get branchTotalSalary(): number {
  return this.branchPayrollData.reduce((s, x) => s + (x.totalSalary ?? 0), 0);
}

  get branchTotalDiscountsOnly(): number {
    return this.branchPayrollData.reduce(
      (s, x) => s + x.totalDiscounts + x.totalContractDiscount,
      0,
    );
  }
get branchTotalDiscounts(): number {
  return this.branchPayrollData.reduce(
    (s, x) => s + (x.totalDiscounts ?? 0) + (x.totalContractDiscount ?? 0), 0
  );
}
  get branchTotalBonuses(): number {
    return this.branchPayrollData.reduce((s, x) => s + x.totalBouns, 0);
  }
  get branchTotalBorrows(): number {
    return this.branchPayrollData.reduce(
      (s, x) => s + x.totalBorrows + x.totalCashBorrows,
      0,
    );
  }
get branchTotalNet(): number {
  return this.branchPayrollData.reduce((s, x) => s + (x.netSalary ?? 0), 0);
}

  get monthlyTotalCashBorrows(): number {
    return this.monthlyPayrollData.reduce((s, x) => s + x.totalCashBorrows, 0);
  }

  // ── Monthly ──────────────────────────────────────────────
  get monthlyTotalContractDiscounts(): number {
    return this.monthlyPayrollData.reduce(
      (s, x) => s + x.totalContractDiscount,
      0,
    );
  }

  get monthlyRemaining(): number {
    return this.monthlyTotalNet - this.monthlyTotalBorrows;
  }

  // ── Branch ───────────────────────────────────────────────
  get branchTotalContractDiscounts(): number {
    return this.branchPayrollData.reduce(
      (s, x) => s + x.totalContractDiscount,
      0,
    );
  }

  get branchRemaining(): number {
    return this.branchTotalNet - this.branchTotalBorrows;
  }

  get branchTotalCashBorrows(): number {
    return this.branchPayrollData.reduce((s, x) => s + x.totalCashBorrows, 0);
  }

  formatTime(time?: string): string {
    if (!time) return "—";
    const [hourStr, minuteStr] = time.split(":");
    const hour = parseInt(hourStr, 10);
    const minutes = minuteStr?.substring(0, 2) ?? "00";
    const period = hour >= 12 ? "م" : "ص";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minutes} ${period}`;
  }

  formatDateDisplay(dateStr: string): string {
    if (!dateStr) return "—";
    return dateStr.substring(0, 10);
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  private exportToExcel(data: any[], fileName: string): void {
    if (!data || !data.length) {
      this.api.showError("لا توجد بيانات للتصدير");
      return;
    }

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { Data: worksheet },
      SheetNames: ["Data"],
    };

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }

  // ===== Tab 1 - الشيفتات =====
  exportShiftsToExcel(): void {
    const pageSize = 100;
    const totalPages = Math.ceil(this.shiftsTotalCount / pageSize);
    const requests: any[] = [];
    const fromDate = this.formatDate(this.shiftsFromDate);
    const toDate = this.formatDate(this.shiftsToDate);

    for (let page = 1; page <= totalPages; page++) {
      requests.push(
        this.api.getAllShifts(
          fromDate,
          toDate,
          page,
          pageSize,
          this.selectedEmployeeId ?? undefined,
          this.selectedBranchId ?? undefined,
        ),
      );
    }

    if (!requests.length) return;

    this.loadingShifts = true;

    forkJoin(requests).subscribe({
      next: (results: any[]) => {
        const excelData = results
          .flatMap((res) => res.data ?? [])
          .map((x: ShiftRecord) => ({
            "اسم الموظف": x.employeeName,
            الفرع: x.branchName,
            اليوم: this.formatDateDisplay(x.day),
            "ميعاد الحضور": this.formatTime(x.scheduledCheckIn),
            "الحضور الفعلي": this.formatTime(x.actualCheckIn),
            "ميعاد الانصراف": this.formatTime(x.scheduledCheckOut),
            "الانصراف الفعلي": this.formatTime(x.actualCheckOut),
            الحالة: this.getStatusLabel(this.getShiftStatus(x)),
          }));

        this.exportToExcel(excelData, "جدول كل الشيفتات");
        this.loadingShifts = false;
      },
      error: () => {
        this.loadingShifts = false;
        this.api.showError("فشل تحميل البيانات");
      },
    });
  }
  // ===== Tab 2 - المتأخرون / المفتوحة =====
  exportOpenLateToExcel(): void {
    const pageSize = 100;
    const totalPages = Math.ceil(this.openLateTotalCount / pageSize);
    const requests: any[] = [];
    const fromDate = this.formatDate(this.shiftsFromDate);
    const toDate = this.formatDate(this.shiftsToDate);

    for (let page = 1; page <= totalPages; page++) {
      requests.push(
        this.api.getAllOpenAndLateShifts(
          fromDate,
          toDate,
          this.selectedShiftType,
          page,
          pageSize,
          this.selectedEmployeeId ?? undefined,
          this.selectedBranchId ?? undefined,
        ),
      );
    }

    if (!requests.length) return;

    this.loadingOpenLate = true;

    forkJoin(requests).subscribe({
      next: (results: any[]) => {
        const excelData = results
          .flatMap((res) => res.data ?? [])
          .map((x: ShiftRecord) => ({
            "اسم الموظف": x.employeeName,
            الفرع: x.branchName,
            اليوم: this.formatDateDisplay(x.day),
            "ميعاد الحضور": this.formatTime(x.scheduledCheckIn),
            "الحضور الفعلي": this.formatTime(x.actualCheckIn),
            "ميعاد الانصراف": this.formatTime(x.scheduledCheckOut),
            "الانصراف الفعلي": this.formatTime(x.actualCheckOut),
            الحالة: this.getStatusLabel(this.getShiftStatus(x)),
          }));

        this.exportToExcel(
          excelData,
          "الشيفتات المفتوحة و المتأخرة و الأوفر تايم",
        );
        this.loadingOpenLate = false;
      },
      error: () => {
        this.loadingOpenLate = false;
        this.api.showError("فشل تحميل البيانات");
      },
    });
  }
  // ===== Tab 3 - الغيابات =====
  exportAbsentToExcel(): void {
    const pageSize = 100;
    const totalPages = Math.ceil(this.absentTotalCount / pageSize);
    const requests: any[] = [];
    const from = this.formatDate(this.absentFromDate);
    const to = this.formatDate(this.absentToDate);

    for (let page = 1; page <= totalPages; page++) {
      requests.push(
        this.api.getAbsentEmployees(
          from,
          to,
          page,
          pageSize,
          this.selectedEmployeeId ?? undefined,
          this.selectedBranchId ?? undefined,
        ),
      );
    }

    if (!requests.length) return;

    this.loadingAbsent = true;

    forkJoin(requests).subscribe({
      next: (results: any[]) => {
        const excelData = results
          .flatMap((res) => res.data ?? [])
          .map((x: AbsentRecord) => ({
            "اسم الموظف": x.employeeName,
            الفرع: x.branchName,
            اليوم: this.formatDateDisplay(x.day),
            "ميعاد الحضور": this.formatTime(x.scheduledCheckIn),
            "ميعاد الانصراف": this.formatTime(x.scheduledCheckOut),
          }));

        this.exportToExcel(excelData, "جدول غيابات الموظفين");
        this.loadingAbsent = false;
      },
      error: () => {
        this.loadingAbsent = false;
        this.api.showError("فشل تحميل البيانات");
      },
    });
  }

  // ===== Tab 5 - الرواتب الشهرية =====
  exportMonthlyPayrollToExcel(): void {
    const pageSize = 100;
    const totalPages = Math.ceil(this.monthlyPayrollTotalCount / pageSize);
    const requests: any[] = [];

    const month = this.monthlyPayrollMonth.getMonth() + 1;
    const year = this.monthlyPayrollMonth.getFullYear();

    for (let page = 1; page <= totalPages; page++) {
      requests.push(this.api.getAllMonthlyData(month, year, page, pageSize));
    }

    if (!requests.length) return;

    this.loadingMonthlyPayroll = true;

    forkJoin(requests).subscribe({
      next: (results: any[]) => {
        const excelData = results
          .flatMap((res) => res.data ?? res)
          .map((x: MonthlyPayrollRecord) => ({
            "كود الموظف": x.employeeId,
            "اسم الموظف": x.employeeName,
            الفرع: x.branchName,
            "شهر / سنة": `${x.month}/${x.year}`,
            التأمينات: x.insurence,
            "ساعات العمل": x.hours,
            "الأوفر تايم": x.hoursOverTime,
            "ساعات النسيان": x.forgetedHours,
            "ساعات الإجازات": x.holidayHours,
            "إجمالي الساعات": x.target,
            "إجمالي المرتب": x.totalSalary,
            الخصومات: x.totalDiscounts,
            "خصومات التعاقد": x.totalContractDiscount,
            المكافآت: x.totalBouns,
            السلف: x.totalBorrows,
            "السلف النقدية": x.totalCashBorrows,
            "صافي المرتب": x.netSalary,
            البنك: x.bankName ?? "",
            "رقم الحساب": x.bankAccount ?? "",
          }));

        this.exportToExcel(excelData, "الرواتب الشهرية");
        this.loadingMonthlyPayroll = false;
      },
      error: () => {
        this.loadingMonthlyPayroll = false;
        this.api.showError("فشل تحميل البيانات");
      },
    });
  }

  // ===== Tab 6 - رواتب الفرع =====
  exportBranchPayrollToExcel(): void {
    if (!this.selectedBranchId) return;

    const pageSize = 100;
    const totalPages = Math.ceil(this.branchPayrollTotalCount / pageSize);
    const requests: any[] = [];

    const month = this.branchPayrollMonth.getMonth() + 1;
    const year = this.branchPayrollMonth.getFullYear();

    for (let page = 1; page <= totalPages; page++) {
      requests.push(
        this.api.getAllMonthlyDatabyBranch(
          month,
          year,
          this.selectedBranchId,
          page,
          pageSize,
        ),
      );
    }

    if (!requests.length) return;

    this.loadingBranchPayroll = true;

    forkJoin(requests).subscribe({
      next: (results: any[]) => {
        const excelData = results
          .flatMap((res) => res.data ?? res)
          .map((x: MonthlyPayrollRecord) => ({
            "كود الموظف": x.employeeId,
            "اسم الموظف": x.employeeName,
            الفرع: x.branchName,
            "شهر / سنة": `${x.month}/${x.year}`,
            التأمينات: x.insurence,
            "ساعات العمل": x.hours,
            "الأوفر تايم": x.hoursOverTime,
            "ساعات النسيان": x.forgetedHours,
            "ساعات الإجازات": x.holidayHours,
            "إجمالي الساعات": x.target,
            "إجمالي المرتب": x.totalSalary,
            الخصومات: x.totalDiscounts,
            "خصومات التعاقد": x.totalContractDiscount,
            المكافآت: x.totalBouns,
            السلف: x.totalBorrows,
            "السلف النقدية": x.totalCashBorrows,
            "صافي المرتب": x.netSalary,
            البنك: x.bankName ?? "",
            "رقم الحساب": x.bankAccount ?? "",
          }));

        this.exportToExcel(excelData, "رواتب الفرع");
        this.loadingBranchPayroll = false;
      },
      error: () => {
        this.loadingBranchPayroll = false;
        this.api.showError("فشل تحميل البيانات");
      },
    });
  }

  exportPayrollDetailsToExcel(): void {
    if (!this.payrollDetails) {
      this.api.showError("لا توجد بيانات");
      return;
    }

    const data = [
      ...this.payrollDetails.discounts.map((x) => ({
        النوع: "خصم",
        القيمة: x.amount,
        السبب: x.reasonOfDiscount,
        ملاحظات: x.notes,
        التاريخ: this.formatDateDisplay(x.date),
      })),

      ...this.payrollDetails.contractDiscounts.map((x) => ({
        النوع: "خصم تعاقد",
        القيمة: x.amount,
        السبب: x.reasonOfDiscount,
        ملاحظات: x.notes,
        التاريخ: this.formatDateDisplay(x.date),
      })),

      ...this.payrollDetails.bonuses.map((x) => ({
        النوع: "مكافأة",
        القيمة: x.amount,
        السبب: x.reason,
        التاريخ: this.formatDateDisplay(x.date),
      })),

      ...this.payrollDetails.cashBorrows.map((x) => ({
        النوع: "سلفة",
        القيمة: x.amount,
        ملاحظات: x.notes,
        التاريخ: this.formatDateDisplay(x.date),
      })),
    ];

    this.exportToExcel(data, "Employee_Payroll");

    this.exportToExcel(data, "Employee_Payroll");
  }

  exportAllToExcel() {
    switch (this.activeTabIndex) {
      case 0:
        this.exportShiftsToExcel();
        break;

      case 1:
        this.exportOpenLateToExcel();
        break;

      case 2:
        this.exportAbsentToExcel();
        break;

      case 3:
        this.exportPayrollDetailsToExcel();
        break;

      case 4:
        this.exportMonthlyPayrollToExcel();
        break;

      case 5:
        this.exportBranchPayrollToExcel();
        break;
    }
  }
}
