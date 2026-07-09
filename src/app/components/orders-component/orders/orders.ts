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
import { CreateOvertime } from "../create-overtime/create-overtime";
import { CreateBorrow } from "../create-borrow/create-borrow";
import { CreateHoliday } from "../create-holiday/create-holiday";
import { CreateMissedHours } from "../create-missed-hours/create-missed-hours";
import { CreateResignation } from "../create-resignation/create-resignation";
import { CreateAppointment } from "../create-appointment/create-appointment";
import { Dialog } from "primeng/dialog";
import { forkJoin } from "rxjs";
import { AutoCompleteModule } from "primeng/autocomplete";
import { Observable } from "rxjs";
import { TooltipModule } from "primeng/tooltip";
import { BadgeModule } from "primeng/badge";
import { UnseenCountsService } from "src/app/services/unseen-counts.service";

@Component({
  selector: "app-orders",
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
    CreateOvertime,
    CreateBorrow,
    CreateHoliday,
    CreateMissedHours,
    CreateResignation,
    CreateAppointment,
    Dialog,
    AutoCompleteModule,
    TooltipModule,
    BadgeModule,
  ],
  templateUrl: "./orders.html",
  styleUrl: "./orders.css",
})
export class Orders implements OnInit {
  activeTabIndex = 0;

  // --- Missed Hours ---
  missedHoursRequests: any[] = [];
  loadingMissedHours = false;
  missedHoursTotalRecords = 0;
  missedHoursPage = 1;
  showCreateMissedHours = false;

  // --- Leave (Holidays) ---
  leaveRequests: any[] = [];
  loadingLeave = false;
  leaveTotalRecords = 0;
  leavePage = 1;
  showCreateLeave = false;

  // --- Loan (Borrows) ---
  loanRequests: any[] = [];
  loadingLoan = false;
  loanTotalRecords = 0;
  loanPage = 1;
  showCreateLoan = false;

  // --- Overtime ---
  overtimeRequests: any[] = [];
  loadingOvertime = false;
  overtimeTotalRecords = 0;
  overtimePage = 1;
  showCreateOvertime = false;

  // --- Resignation ---
  resignationRequests: any[] = [];
  loadingResignation = false;
  resignationTotalRecords = 0;
  resignationPage = 1;
  showCreateResignation = false;

  // --- Appointment ---
  appointmentRequests: any[] = [];
  loadingAppointment = false;
  appointmentTotalRecords = 0;
  appointmentPage = 1;
  showCreateAppointment = false;

  showRejectDialog = false;
  selectedRequestId = "";
  selectedRequestType = "";
  rejectionReason = "";
  showArchive = false;

  unseenCounts = {
    overtime: 0,
    borrows: 0,
    holidays: 0,
    resignations: 0,
    appointments: 0,
    forgotHours: 0,
  };

  selectedLeaveId: number | null = null;
  showCoverDialog = false;
  coverEmployee: any = null;
  filteredEmployees: any[] = [];

  employees: any[] = [];
  totalRecords = 0;
  page = 1;
  pageSize = 10;
  loading = false;

  constructor(
    private api: Apiservice,
    private cdr: ChangeDetectorRef,
    public auth: AuthService,
    private unseenCountsService: UnseenCountsService,
  ) {}

ngOnInit() {
  if (this.auth.isHR || this.auth.isEmployee) {
    this.loadMissedHours();
  }

  this.unseenCountsService.counts$.subscribe((counts) => {
    this.unseenCounts = counts;
    this.cdr.detectChanges();
  });

  if (this.auth.isHR || this.auth.isEmployee || this.auth.isAreaManager) {
    this.loadUnseenCounts();
  }

  if (this.auth.isAreaManager) {
    this.activeTabIndex = 1;
    this.loadLeave();
  }
}

  get isEmployee(): boolean {
    return !(
      this.auth.isAdmin ||
      this.auth.isHR ||
      this.auth.isAreaManager ||
      this.auth.isManager ||
      this.auth.isControl ||
      this.auth.isAccountant
    );
  }

  get employeeId(): string {
    return localStorage.getItem("employeeId") || "";
  }

  get isAreaManager(): boolean {
    return localStorage.getItem("role") === "AreaManager";
  }

  get branchIds(): string[] {
    const raw = localStorage.getItem("branchId"); // نفس نمط "role"
    return raw ? raw.split(",").map((id: string) => id.trim()) : [];
  }

  onTabChange(index: number) {
    this.activeTabIndex = index;
    if (index === 0 && !this.missedHoursRequests.length) this.loadMissedHours();
    if (index === 1 && !this.leaveRequests.length) this.loadLeave();
    if (index === 2 && !this.loanRequests.length) this.loadLoan();
    if (index === 3 && !this.overtimeRequests.length) this.loadOvertime();
    if (index === 4 && !this.resignationRequests.length) this.loadResignation();
    if (index === 5 && !this.appointmentRequests.length) this.loadAppointment();
  }

  // ---- Loaders ----

  loadMissedHours() {
    this.loadingMissedHours = true;

    const request = this.isEmployee
      ? this.api.getForgetedHoursRequestsForUser(
          this.employeeId,
          this.missedHoursPage,
          10,
        )
      : this.api.getForgetedHoursRequests(
          this.missedHoursPage,
          10,
          this.auth.isHR ? this.showArchive : undefined,
        );

    request.subscribe({
      next: (res: any) => {
        this.missedHoursRequests = this.normalizeRequests(res.data || []);
        this.missedHoursTotalRecords = res.totalCount ?? this.missedHoursRequests.length;
        this.loadingMissedHours = false;
        if (this.isEmployee) {
          this.missedHoursRequests.forEach((req) =>
            this.markAsSeen("missedHours", req.id),
          );
        }
        this.cdr.detectChanges();
      },
      error: () => (this.loadingMissedHours = false),
    });
  }

  loadLeave() {
    this.loadingLeave = true;

    const request = this.isEmployee
      ? this.api.getAllHolidaysForUser(this.employeeId, this.leavePage, 10)
      : this.api.getAllHolidays(
          this.leavePage,
          10,
          this.auth.isHR ? this.showArchive : undefined,
        );

    request.subscribe({
      next: (res: any) => {
        this.leaveRequests = this.normalizeRequests(res.data || []);
        this.leaveTotalRecords = res.totalCount ?? this.leaveRequests.length;
        this.loadingLeave = false;
        if (this.isEmployee) {
          this.leaveRequests.forEach((req) => this.markAsSeen("leave", req.id));
        }
        this.cdr.detectChanges();
      },
      error: () => (this.loadingLeave = false),
    });
  }

  loadLoan() {
    this.loadingLoan = true;

    const request = this.isEmployee
      ? this.api.getAllBorrowsForUser(this.employeeId, this.loanPage, 10)
      : this.api.getAllBorrows(
          this.loanPage,
          10,
          this.auth.isHR ? this.showArchive : undefined,
        );

    request.subscribe({
      next: (res: any) => {
        this.loanRequests = this.normalizeRequests(res.data || []);
        this.loanTotalRecords = res.totalCount ?? this.loanRequests.length;
        this.loadingLoan = false;
        if (this.isEmployee) {
          this.loanRequests.forEach((req) => this.markAsSeen("loan", req.id));
        }
        this.cdr.detectChanges();
      },
      error: () => (this.loadingLoan = false),
    });
  }

  loadOvertime() {
    this.loadingOvertime = true;

    const request = this.isEmployee
      ? this.api.getAllOvertimeForUser(this.employeeId, this.overtimePage, 10)
      : this.api.getAllOvertime(
          this.overtimePage,
          10,
          this.auth.isHR ? this.showArchive : undefined,
        );

    request.subscribe({
      next: (res: any) => {
        this.overtimeRequests = this.normalizeRequests(res.data || []);
        this.overtimeTotalRecords = res.totalCount ?? this.overtimeRequests.length;
        this.loadingOvertime = false;
        if (this.isEmployee) {
          this.overtimeRequests.forEach((req) =>
            this.markAsSeen("overtime", req.id),
          );
        }
        this.cdr.detectChanges();
      },
      error: () => (this.loadingOvertime = false),
    });
  }

  loadResignation() {
    this.loadingResignation = true;

    const request = this.isEmployee
      ? this.api.getAllResignationsForUser(
          this.employeeId,
          this.resignationPage,
          10,
        )
      : this.api.getAllResignations(
          this.resignationPage,
          10,
          this.auth.isHR ? this.showArchive : undefined,
        );

    request.subscribe({
      next: (res: any) => {
        this.resignationRequests = this.normalizeRequests(res.data || []);
        this.resignationTotalRecords = res.totalCount ?? this.resignationRequests.length;
        this.loadingResignation = false;
        if (this.isEmployee) {
          this.resignationRequests.forEach((req) =>
            this.markAsSeen("resignation", req.id),
          );
        }
        this.cdr.detectChanges();
      },
      error: () => (this.loadingResignation = false),
    });
  }

  loadAppointment() {
    this.loadingAppointment = true;

    const request = this.isEmployee
      ? this.api.getAllAppointmentsForUser(
          this.employeeId,
          this.appointmentPage,
          10,
        )
      : this.api.getAllAppointments(
          this.appointmentPage,
          10,
          this.auth.isHR ? this.showArchive : undefined,
        );

    request.subscribe({
      next: (res: any) => {
        this.appointmentRequests = this.normalizeRequests(res.data || []);
        this.appointmentTotalRecords = res.totalCount ?? this.appointmentRequests.length;
        this.loadingAppointment = false;
        if (this.isEmployee) {
          this.appointmentRequests.forEach((req) =>
            this.markAsSeen("appointment", req.id),
          );
        }
        this.cdr.detectChanges();
      },
      error: () => (this.loadingAppointment = false),
    });
  }

  // ---- Pagination ----

  private normalizeRequests<T extends { isSeenByHR?: boolean }>(items: T[] = []): T[] {
    return items.map((item) => ({
      ...item,
      isSeenByHR: item.isSeenByHR ?? false,
    }));
  }

  toggleArchiveView() {
    if (!this.auth.isHR) {
      return;
    }

    this.showArchive = !this.showArchive;
    this.reloadCurrentTab();
  }

  private reloadCurrentTab() {
    switch (this.activeTabIndex) {
      case 0:
        this.loadMissedHours();
        break;
      case 1:
        this.loadLeave();
        break;
      case 2:
        this.loadLoan();
        break;
      case 3:
        this.loadOvertime();
        break;
      case 4:
        this.loadResignation();
        break;
      case 5:
        this.loadAppointment();
        break;
    }
  }

  onMissedHoursPageChange(event: any) {
    this.missedHoursPage = event.first / event.rows + 1;
    this.loadMissedHours();
  }

  onLeavePageChange(event: any) {
    this.leavePage = event.first / event.rows + 1;
    this.loadLeave();
  }

  onLoanPageChange(event: any) {
    this.loanPage = event.first / event.rows + 1;
    this.loadLoan();
  }

  onOvertimePageChange(event: any) {
    this.overtimePage = event.first / event.rows + 1;
    this.loadOvertime();
  }

  onResignationPageChange(event: any) {
    this.resignationPage = event.first / event.rows + 1;
    this.loadResignation();
  }

  onAppointmentPageChange(event: any) {
    this.appointmentPage = event.first / event.rows + 1;
    this.loadAppointment();
  }

  // ---- Approve / Reject ----

  approveRequest(type: string, id: string) {
    const payload = {
      isApproved: true,
      rejectionReason: null,
    };

    let call!: Observable<any>;

    if (type === "missedHours") {
      call = this.api.approveForgetedHoursRequest(id, payload);
    } else if (type === "leave") {
      call = this.api.approveHolidayRequestByHr(id, payload);
    } else if (type === "loan") {
      call = this.api.approveOrRejectBorrowRequest(id, payload);
    } else if (type === "overtime") {
      if (this.auth.isHR) {
        call = this.api.approveByHrOvertimeRequest(id, payload);
      } else if (this.auth.isAreaManager) {
        call = this.api.approveByAreaManagerOvertimeRequest(id, payload);
      } else if (this.auth.isControl) {
        call = this.api.approveByControlOvertimeRequest(id, payload);
      }
    } else if (type === "resignation") {
      call = this.api.approveResignationRequest(id, payload);
    } else {
      call = this.api.approveAppointmentRequest(id, payload);
    }

    call.subscribe({
      next: () => {
        this.api.showSuccess("تم القبول بنجاح");
        this.markAsSeen(type, id);
        this.reloadByType(type);
        this.loadUnseenCounts();
      },
      error: () => this.api.showError("حدث خطأ أثناء القبول"),
    });
  }

  rejectRequest(type: string, id: string, rejectionReason: string) {
    const payload = {
      isApproved: false,
      rejectionReason,
    };

    let call!: Observable<any>;

    if (type === "missedHours") {
      call = this.api.rejectForgetedHoursRequest(id, payload);
    } else if (type === "leave") {
      call = this.api.approveHolidayRequestByHr(id, payload);
    } else if (type === "loan") {
      call = this.api.approveOrRejectBorrowRequest(id, payload);
    } else if (type === "overtime") {
      if (this.auth.isHR) {
        call = this.api.approveByHrOvertimeRequest(id, payload);
      } else if (this.auth.isAreaManager) {
        call = this.api.approveByAreaManagerOvertimeRequest(id, payload);
      } else if (this.auth.isControl) {
        call = this.api.approveByControlOvertimeRequest(id, payload);
      }
    } else if (type === "resignation") {
      call = this.api.approveResignationRequest(id, payload);
    } else {
      call = this.api.approveAppointmentRequest(id, payload);
    }

    call.subscribe({
      next: () => {
        this.api.showSuccess("تم الرفض");
        this.markAsSeen(type, id);
        setTimeout(() => {
          this.reloadByType(type);
          this.loadUnseenCounts();
        }, 100);
      },
      error: () => this.api.showError("حدث خطأ أثناء الرفض"),
    });
  }

  loadEmployees() {
    this.loading = true;

    if (this.isAreaManager) {
      const branchIds = this.branchIds;

      if (!branchIds.length) {
        this.loading = false;
        return;
      }

      const requests = branchIds.map((branchId) =>
        this.api.getAllEmployeesByBranch(this.page, this.pageSize, branchId),
      );

      forkJoin(requests).subscribe({
        next: (results: any[]) => {
          this.employees = results.flatMap((res) => res.data);
          this.totalRecords = results.reduce(
            (sum, res) => sum + res.totalCount,
            0,
          );
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
        },
      });
    }
  }
  // الإجازات — قبول مدير المنطقة

  approveLeaveByAreaManager(id: number) {
    this.selectedLeaveId = id;
    this.coverEmployee = null;
    this.showCoverDialog = true;
    this.loadEmployees();
  }

  confirmAreaManagerApproval() {
    if (this.selectedLeaveId == null) {
      return;
    }

    const payload = {
      isApproved: true,
      cover: this.coverEmployee,
      rejectionReason: null,
    };

    this.api
      .approveHolidayRequestByAreaManager(
        this.selectedLeaveId.toString(),
        payload,
      )
      .subscribe({
        next: () => {
          this.showCoverDialog = false;
          this.api.showSuccess("تمت الموافقة بنجاح");
          this.loadLeave();
          this.loadUnseenCounts();
        },
      });
  }

  // الأوفر تايم — قبول مدير المنطقة
  approveOvertimeByAreaManager(id: string) {
    const payload = {
      isApproved: true,
      rejectionReason: null,
    };

    this.api.approveByAreaManagerOvertimeRequest(id, payload).subscribe({
      next: () => {
        this.api.showSuccess("تم القبول بواسطة مدير المنطقة");
        this.loadOvertime();
        this.loadUnseenCounts();
      },
      error: () => this.api.showError("حدث خطأ"),
    });
  }

  // الأوفر تايم — قبول الكنترول
  approveOvertimeByControl(id: string) {
    const payload = {
      isApproved: true,
      rejectionReason: null,
    };

    this.api.approveByControlOvertimeRequest(id, payload).subscribe({
      next: () => {
        this.api.showSuccess("تم القبول بواسطة الكنترول");
        this.loadOvertime();
        this.loadUnseenCounts();
      },
      error: () => this.api.showError("حدث خطأ"),
    });
  }

  // ---- Reload by type ----

  reloadByType(type: string) {
    if (type === "missedHours") this.loadMissedHours();
    if (type === "leave") this.loadLeave();
    if (type === "loan") this.loadLoan();
    if (type === "overtime") this.loadOvertime();
    if (type === "resignation") this.loadResignation();
    if (type === "appointment") this.loadAppointment();
  }

  // ---- On Created ----

  onMissedHoursCreated() {
    this.showCreateMissedHours = false;
    this.loadMissedHours();
  }

  onLeaveCreated() {
    this.showCreateLeave = false;
    this.loadLeave();
  }

  onLoanCreated() {
    this.showCreateLoan = false;
    this.loadLoan();
  }

  onOvertimeCreated() {
    this.showCreateOvertime = false;
    this.loadOvertime();
  }

  onResignationCreated() {
    this.showCreateResignation = false;
    this.loadResignation();
  }

  onAppointmentCreated() {
    this.showCreateAppointment = false;
    this.loadAppointment();
  }

  confirmReject() {
    this.rejectRequest(
      this.selectedRequestType,
      this.selectedRequestId,
      this.rejectionReason,
    );

    this.showRejectDialog = false;
  }

  openRejectDialog(type: string, id: string) {
    this.selectedRequestType = type;
    this.selectedRequestId = id;
    this.rejectionReason = "";
    this.showRejectDialog = true;
  }
  // ---- Helpers ----

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      Pending: "قيد الانتظار",
      Approved: "مقبول",
      Rejected: "مرفوض",
      ControlApproved: "مقبول من الكنترول",
      AreaManagerApproved: "مقبول من مدير المنطقة",
      ControlRejected: "مرفوض من الكنترول",
      AreaManagerRejected: "مرفوض من مدير المنطقة",
    };
    return map[status] ?? status;
  }

  getStatusClass(status: string): Record<string, boolean> {
    return {
      "bg-warning  text-warning": status === "Pending",
      "bg-success  text-success":
        status === "Approved" ||
        status === "ControlApproved" ||
        status === "AreaManagerApproved",
      "bg-danger  text-danger":
        status === "Rejected" ||
        status === "ControlRejected" ||
        status === "AreaManagerRejected",
    };
  }

  private markAsSeen(type: string, id: string) {
    let call;

    switch (type) {
      case "missedHours":
        call = this.api.markForgetedHoursRequestAsSeen(id);
        break;

      case "leave":
        call = this.api.markHolidayRequestAsSeen(id);
        break;

      case "loan":
        call = this.api.markBorrowAsSeen(id);
        break;

      case "overtime":
        call = this.api.markOvertimeRequestAsSeen(id);
        break;

      case "resignation":
        call = this.api.markResignationRequestAsSeen(id);
        break;

      case "appointment":
        call = this.api.markAppointmentRequestAsSeen(id);
        break;

      default:
        return;
    }

    call.subscribe();
  }

  hasRejected(requests: any[]): boolean {
    return requests.some((req) => req.status === "Rejected");
  }

  revealRejectionReason(req: any, type: string) {
    req._seen = true;
    this.markAsSeen(type, req.id);
  }

 loadUnseenCounts() {
  this.unseenCountsService.refreshAll();
}

  private updateOrdersBadge() {
    const total =
      this.unseenCounts.overtime +
      this.unseenCounts.borrows +
      this.unseenCounts.holidays +
      this.unseenCounts.resignations +
      this.unseenCounts.appointments +
      this.unseenCounts.forgotHours;
    this.cdr.detectChanges();
  }

  get disablemissedHoursRequests(): boolean {
    return this.missedHoursRequests.length >= 3;
  }

  get isLoanRequestAllowed(): boolean {
    const today = new Date().getDate();
    return today >= 10 && today <= 25;
  }
}