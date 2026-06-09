import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DatePickerModule } from "primeng/datepicker";
import { SelectModule } from "primeng/select";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { MessageModule } from "primeng/message";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "primeng/tabs";
import { Apiservice } from "src/app/services/api.service";
import { AuthService } from "src/app/services/auth.service";
import { Dialog } from "primeng/dialog";
import { forkJoin } from "rxjs";

@Component({
  selector: "app-my-details",
  imports: [
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    FormsModule,
    CommonModule,
    DatePickerModule,
    SelectModule,
    TableModule,
    TagModule,
    MessageModule,
  ],
  templateUrl: "./my-details.html",
  styleUrl: "./my-details.css",
})
export class MyDetails {
  activeTabIndex = "0";
  employeeDetails: any = null;
  loading = false;
  payrollViewType: "current" | "custom" = "current";
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  showPayrollDetails = false;

  constructor(
    private api: Apiservice,
    private cdr: ChangeDetectorRef,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

 get employeeId(): string {
  return localStorage.getItem("employeeId") || "";
}

  loadData(): void {
    this.loading = true;

    const payrollRequest =
      this.payrollViewType === "current"
        ? this.api.getMonthyDataForuser(this.employeeId)
        : this.api.getmonthlyDataForuserByMonth(
            this.employeeId,
            this.selectedMonth,
            this.selectedYear,
          );

    forkJoin({
      employee: this.api.getEmployeeById(this.employeeId),
      payroll: payrollRequest,
      attendance: this.api.getScheduleByEmployeeId(this.employeeId),
    }).subscribe({
      next: (res: any) => {
        this.employeeDetails = {
          ...res.employee,
          ...res.payroll,
          attendance: (res.attendance || []).map((item: any) => ({
            ...item,
            isEditing: false,
          })),
        };

        this.showPayrollDetails = true;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.api.showError("لايوجد بيانات لهذا الشهر");
      },
    });
  }

  reloadPayrollData(): void {
    this.loadData();
  }

    formatTime(time: string): string {
    if (!time) return "-";
    const [hours, minutes] = time.split(":");
    let hour = +hours;
    const period = hour >= 12 ? "مساءً" : "صباحاً";
    hour = hour % 12 || 12;
    return `${hour}:${minutes} ${period}`;
  }

  // reloadPayrollData(): void {
  //   this.loading = true;
  //   this.showPayrollDetails = false;

  //   const req =
  //     this.payrollViewType === "current"
  //       ? this.api.getAllReportsForEmpolyee(this.employeeId)
  //       : this.api.getAllReportsForEmpolyeeInMonthAndYear(
  //           this.employeeId,
  //           this.selectedMonth,
  //           this.selectedYear,
  //         );

  //   req.subscribe({
  //     next: (res: any) => {
  //       this.employeeDetails = res;
  //       this.showPayrollDetails = true;
  //       this.loading = false;
  //     },
  //     error: () => (this.loading = false),
  //   });
  // }

  getStatusClass(status: string): string {
    switch (status) {
      case "Approved":
        return "bg-success bg-opacity-25 text-success";
      case "Rejected":
        return "bg-danger bg-opacity-25 text-danger";
      case "Pending":
        return "bg-warning bg-opacity-25 text-warning";
      default:
        return "bg-secondary bg-opacity-25 text-secondary";
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case "Approved":
        return "مقبول";
      case "Rejected":
        return "مرفوض";
      case "Pending":
        return "قيد الانتظار";
      default:
        return status;
    }
  }
}
