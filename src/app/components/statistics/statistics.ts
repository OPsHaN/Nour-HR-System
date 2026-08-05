import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Apiservice } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { BranchComparisonService, BranchPayrollComparisonState } from 'src/app/services/branch-comparison.service';

interface MonthlyPayrollRecord {
  employeeId: number;
  employeeName: string;
  branchName: string;
  totalSalary?: number;
}

interface PayrollDetails {
  discounts: { id: number; amount: number; reasonOfDiscount: string; notes?: string; date: string }[];
  contractDiscounts: { id: number; amount: number; reasonOfDiscount: string; notes?: string; date: string }[];
  bonuses: { id: number; amount: number; reason?: string; notes?: string; dateOfBonus: string }[];
  cashBorrows: { id: number; amount: number; reason?: string; notes?: string; dateOfBorrow: string }[];
}

interface PayrollTotals {
  discounts: number;
  bonuses: number;
  borrows: number;
}

interface EmployeePayrollComparisonState {
  employeeId: number;
  employeeName: string;
  month1: { month: number; year: number; label: string };
  month2: { month: number; year: number; label: string };
  details1: PayrollDetails;
  details2: PayrollDetails;
  totals1: PayrollTotals;
  totals2: PayrollTotals;
}

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerModule, SelectModule, TableModule, ButtonModule, BaseChartDirective],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css',
})
export class Statistics implements OnInit {
  public chartType: 'bar' | 'line' = 'bar';

  public branchChartData: any = {
    labels: [] as string[],
    datasets: [
      {
        label: 'الراتب',
        data: [] as number[],
        backgroundColor: [] as string[],
        borderColor: 'rgba(54, 162, 235, 0.8)',
        fill: false,
      },
    ],
  };

  public branchChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed?.y ?? 0;
            return `${context.dataset.label}: ${value.toLocaleString()} ج.م`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  public employeeChartData: any = {
    labels: ['خصومات', 'بونص', 'سلف'],
    datasets: [],
  };

  public employeeChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed?.y ?? 0;
            return `${context.dataset.label}: ${value.toLocaleString()} ج.م`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  public branchPayrollMonth1: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  public branchPayrollMonth2: Date = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  public selectedBranchId: string | null = null;
  public branches: any[] = [];
  public loadingBranches = false;
  public loadingComparison = false;
  public comparisonTitle = 'مقارنة رواتب الفروع';
  public comparisonState: BranchPayrollComparisonState | null = null;

  public employeePayrollMonth1: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  public employeePayrollMonth2: Date = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  public selectedEmployeeId: number | null = null;
  public employees: any[] = [];
  public loadingEmployees = false;
  public loadingEmployeeComparison = false;
  public employeeComparisonTitle = 'مقارنة كشف رواتب الموظف';
  public employeeComparisonState: EmployeePayrollComparisonState | null = null;

  constructor(
    private api: Apiservice,
    private auth: AuthService,
    private branchComparisonService: BranchComparisonService,
  ) {}

  ngOnInit(): void {
    this.loadBranches();
    this.loadEmployees();
    this.branchComparisonService.comparison$.subscribe((state) => {
      this.comparisonState = state;
      this.updateChart(state);
    });
  }

  public setChartType(type: 'bar' | 'line'): void {
    this.chartType = type;
  }

  public loadBranches(): void {
    this.loadingBranches = true;
    this.api.getAllBranches(1, 999).subscribe({
      next: (res: any) => {
        this.branches = res.data ?? res ?? [];
        this.loadingBranches = false;
      },
      error: () => {
        this.loadingBranches = false;
        this.api.showError('فشل تحميل بيانات الفروع');
      },
    });
  }

  public loadEmployees(): void {
    this.loadingEmployees = true;
    this.api.getAllEmployees(1, 999).subscribe({
      next: (res: any) => {
        this.employees = res.data ?? res ?? [];
        this.loadingEmployees = false;
      },
      error: () => {
        this.loadingEmployees = false;
        this.api.showError('فشل تحميل بيانات الموظفين');
      },
    });
  }

  public compareBranchPayroll(): void {
    if (!this.selectedBranchId || !this.branchPayrollMonth1 || !this.branchPayrollMonth2) {
      this.api.showError('اختر الفرع والشهرين للمقارنة');
      return;
    }

    const month1 = this.branchPayrollMonth1.getMonth() + 1;
    const year1 = this.branchPayrollMonth1.getFullYear();
    const month2 = this.branchPayrollMonth2.getMonth() + 1;
    const year2 = this.branchPayrollMonth2.getFullYear();
    const branchId = this.selectedBranchId;

    this.loadingComparison = true;

    forkJoin([
      this.getBranchPayrollRecords(branchId, month1, year1),
      this.getBranchPayrollRecords(branchId, month2, year2),
    ]).subscribe({
      next: ([data1, data2]) => {
        const comparisonRows = this.buildBranchPayrollComparison(data1, data2);

        this.branchComparisonService.setComparison({
          branchId,
          branchName: this.branches.find((b) => b.id === branchId)?.name ?? '',
          month1: {
            month: month1,
            year: year1,
            label: `${month1}/${year1}`,
          },
          month2: {
            month: month2,
            year: year2,
            label: `${month2}/${year2}`,
          },
          rows: comparisonRows,
        });

        this.loadingComparison = false;
      },
      error: () => {
        this.loadingComparison = false;
        this.api.showError('فشل تحميل بيانات المقارنة');
      },
    });
  }

  public clearBranchComparison(): void {
    this.comparisonState = null;
    this.branchChartData = {
      labels: [],
      datasets: [
        {
          label: 'الراتب',
          data: [],
          backgroundColor: [],
          borderColor: 'rgba(54, 162, 235, 0.8)',
          fill: false,
        },
      ],
    };
    this.comparisonTitle = 'مقارنة رواتب الفروع';
  }

  public compareEmployeePayroll(): void {
    if (!this.selectedEmployeeId || !this.employeePayrollMonth1 || !this.employeePayrollMonth2) {
      this.api.showError('اختر الموظف والشهرين للمقارنة');
      return;
    }

    const month1 = this.employeePayrollMonth1.getMonth() + 1;
    const year1 = this.employeePayrollMonth1.getFullYear();
    const month2 = this.employeePayrollMonth2.getMonth() + 1;
    const year2 = this.employeePayrollMonth2.getFullYear();
    const employeeId = this.selectedEmployeeId;

    this.loadingEmployeeComparison = true;

    forkJoin([
      this.api.getAllReportsForEmpolyeeInMonthAndYear(employeeId, month1, year1),
      this.api.getAllReportsForEmpolyeeInMonthAndYear(employeeId, month2, year2),
    ]).subscribe({
      next: ([details1, details2]: [any, any]) => {
        const totals1 = this.calculatePayrollTotals(details1);
        const totals2 = this.calculatePayrollTotals(details2);

        this.employeeComparisonState = {
          employeeId,
          employeeName: this.employees.find((e) => e.id === employeeId)?.name ?? '',
          month1: { month: month1, year: year1, label: `${month1}/${year1}` },
          month2: { month: month2, year: year2, label: `${month2}/${year2}` },
          details1,
          details2,
          totals1,
          totals2,
        };

        this.updateEmployeeChart(this.employeeComparisonState);
        this.loadingEmployeeComparison = false;
      },
      error: () => {
        this.loadingEmployeeComparison = false;
        this.api.showError('فشل تحميل بيانات كشف الرواتب للمقارنة');
      },
    });
  }

  private calculatePayrollTotals(details: PayrollDetails): PayrollTotals {
    const discounts =
      (details.discounts?.reduce((s, x) => s + x.amount, 0) ?? 0) +
      (details.contractDiscounts?.reduce((s, x) => s + x.amount, 0) ?? 0);
    const bonuses = details.bonuses?.reduce((s, x) => s + x.amount, 0) ?? 0;
    const borrows = details.cashBorrows?.reduce((s, x) => s + x.amount, 0) ?? 0;

    return { discounts, bonuses, borrows };
  }

  public clearEmployeeComparison(): void {
    this.employeeComparisonState = null;
    this.employeeChartData = {
      labels: ['خصومات', 'بونص', 'سلف'],
      datasets: [],
    };
  }

  public formatDateDisplay(date: string | Date): string {
    if (!date) return '';
    const value = typeof date === 'string' ? new Date(date) : date;
    return value.toLocaleDateString('ar-EG');
  }

  public get showBranchComparison(): boolean {
    return this.auth.isAccountant;
  }

  public get showEmployeeComparison(): boolean {
    return this.auth.isHR;
  }

  private updateEmployeeChart(state: EmployeePayrollComparisonState | null): void {
    if (!state) {
      this.employeeChartData = {
        labels: ['خصومات', 'بونص', 'سلف'],
        datasets: [],
      };
      return;
    }

    this.employeeChartData = {
      labels: ['خصومات', 'بونص', 'سلف'],
      datasets: [
        {
          label: `شهر ${state.month1.label}`,
          data: [state.totals1.discounts, state.totals1.bonuses, state.totals1.borrows],
          backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(54, 162, 235, 0.6)'],
        },
        {
          label: `شهر ${state.month2.label}`,
          data: [state.totals2.discounts, state.totals2.bonuses, state.totals2.borrows],
          backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        },
      ],
    };
  }

  private updateChart(state: BranchPayrollComparisonState | null): void {
    if (!state) {
      this.branchChartData = {
        labels: [],
        datasets: [
          {
            label: 'الراتب',
            data: [],
            backgroundColor: [],
          },
        ],
      };
      this.comparisonTitle = 'مقارنة رواتب الفروع';
      return;
    }

    const labels = state.rows.map((row) => row.employeeName);
    const data1 = state.rows.map((row) => row.salary1);
    const data2 = state.rows.map((row) => row.salary2);

    this.branchChartData = {
      labels,
      datasets: [
        {
          label: `شهر ${state.month1.label}`,
          data: data1,
          backgroundColor: labels.map(() => 'rgba(54, 162, 235, 0.6)'),
        },
        {
          label: `شهر ${state.month2.label}`,
          data: data2,
          backgroundColor: labels.map(() => 'rgba(255, 99, 132, 0.6)'),
        },
      ] as any,
    };

    this.comparisonTitle = `مقارنة فرع ${state.branchName} (${state.month1.label} مقابل ${state.month2.label})`;
  }

  private getBranchPayrollRecords(
    branchId: string,
    month: number,
    year: number,
  ) {
    const pageSize = 100;
    return this.api.getAllMonthlyDatabyBranch(month, year, branchId, 1, pageSize).pipe(
      switchMap((res: any) => {
        const data = res.data ?? res ?? [];
        const totalCount = res.totalCount ?? data.length;
        const totalPages = Math.ceil(totalCount / pageSize);

        if (totalPages <= 1) {
          return of(data);
        }

        const requests: any[] = [];
        for (let page = 2; page <= totalPages; page += 1) {
          requests.push(
            this.api.getAllMonthlyDatabyBranch(month, year, branchId, page, pageSize),
          );
        }

        return forkJoin(requests).pipe(
          map((results: any[]) => [
            ...data,
            ...results.flatMap((result) => result.data ?? result ?? []),
          ]),
        );
      }),
    );
  }

  private buildBranchPayrollComparison(
    data1: MonthlyPayrollRecord[],
    data2: MonthlyPayrollRecord[],
  ) {
    const map2 = new Map<number, MonthlyPayrollRecord>();
    data2.forEach((row) => map2.set(row.employeeId, row));
    const rows: BranchPayrollComparisonState['rows'] = [];

    data1.forEach((row1) => {
      const row2 = map2.get(row1.employeeId);
      const salary1 = row1.totalSalary ?? 0;
      const salary2 = row2?.totalSalary ?? 0;
      const diff = salary2 - salary1;
      const percent = salary1 ? (diff / salary1) * 100 : salary2 ? 100 : 0;

      rows.push({
        employeeId: row1.employeeId,
        employeeName: row1.employeeName,
        branchName: row1.branchName,
        salary1,
        salary2,
        diff,
        percent,
      });

      if (row2) {
        map2.delete(row1.employeeId);
      }
    });

    map2.forEach((row2) => {
      const salary2 = row2.totalSalary ?? 0;
      rows.push({
        employeeId: row2.employeeId,
        employeeName: row2.employeeName,
        branchName: row2.branchName,
        salary1: 0,
        salary2,
        diff: salary2,
        percent: salary2 ? 100 : 0,
      });
    });

    return rows.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  }

  get comparisonTotalSalary1(): number {
    return this.comparisonState?.rows.reduce((s, x) => s + x.salary1, 0) ?? 0;
  }

  get comparisonTotalSalary2(): number {
    return this.comparisonState?.rows.reduce((s, x) => s + x.salary2, 0) ?? 0;
  }

  get comparisonTotalDiff(): number {
    return this.comparisonTotalSalary2 - this.comparisonTotalSalary1;
  }

  get comparisonPercentChange(): number {
    const base = this.comparisonTotalSalary1;
    if (!base) return this.comparisonTotalSalary2 ? 100 : 0;
    return (this.comparisonTotalDiff / base) * 100;
  }
}
