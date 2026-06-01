import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ConfirmationService } from "primeng/api";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { Apiservice } from "src/app/services/api.service";
import { CreateEmployee } from "../create-employee/create-employee";
import { Dialog } from "primeng/dialog";
import { DatePickerModule } from "primeng/datepicker";
import { Menu } from "primeng/menu";
import { Tabs, TabPanels, TabPanel, TabList, Tab } from "primeng/tabs";
import { Subscription } from "rxjs";
import { forkJoin } from "rxjs";
import { ProgressSpinnerModule } from "primeng/progressspinner";

@Component({
  selector: "app-employees",
  imports: [
    TableModule,
    TagModule,
    FormsModule,
    CommonModule,
    CreateEmployee,
    Dialog,
    DatePickerModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Menu,
    ProgressSpinnerModule,
  ],
  templateUrl: "./employees.html",
  styleUrl: "./employees.css",
})
export class Employees {
  employees: any[] = [];
  totalRecords = 0;
  page = 1;
  pageSize = 10;
  loading = false;
  showCreateEmployee: boolean = false;
  selectedEmployee: any = null;
  showEndServiceDialog = false;
  endServiceReason = "";
  endOfServiceType = "";
  employeeDetails: any = null;
  showEmployeeDetailsDialog = false;
  isEditMode = false;
  branches: any[] = [];
  banks: any[] = [];
  Criteria: any[] = [];
  showAttendanceDialog = false;
  employeeAttendance: any[] = [];
  employeeName: string = "";
  selectedEmployeeId: string = "";
  searchTerm: string = "";
  activeEmployeeId: number | null = null;
  @ViewChild("menu") menu!: Menu;
  showPayrollFilterDialog = false;
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  selectedEmployeeForPayroll: any = null;
  isCurrentMonth = true;
  payrollViewType = "current";
  showPayrollDetails = false;
  payrollRequestSub: Subscription | null = null;
  payrollLoading = false;
  actionDialogVisible = false;
  currentActionType = "";
  currentActionTitle = "";
  quarters: any[] = [
    { value: "Q1", label: "الربع الأول" },
    { value: "Q2", label: "الربع الثاني" },
    { value: "Q3", label: "الربع الثالث" },
    { value: "Q4", label: "الربع الرابع" },
  ];
  actionItems: any[] = [];
  actionForm: any = {};
  actionLoading = false;
  activeTabIndex: string = "0";
  selectedBranchFilter: string = "";
  selectedBankFilter: string = "";
  selectedRoleFilter: string = "";
  showGroupMode: boolean = false;
  selectedEmployeeIds: number[] = [];
  showGroupDialog: boolean = false;
  groupAmount: number | null = null;
  groupReason: string = "";
  groupNotes: string = "";
  groupActionType: "bonus" | "discount" | "contractDiscount" = "bonus";
  evaluationResults: { evaluationCriteriaId: number; rating: string }[] = [];
  groupSubType: "amount" | "days" = "amount";
  loadingDeductionCalc = false;
  deductionCalcData: {
    employeeId: number;
    employeeName: string;
    deductions: {
      halfDay: number;
      oneDay: number;
      twoDays: number;
      threeDays: number;
      fiveDays: number;
      tenDays: number;
    };
  }[] = [];
  loadingResponsibilities = false;
  selectedDayPerEmployee: Record<number, string> = {};
  actionSubType: "amount" | "days" = "amount";
  selectedSingleDay: string = "";

  dayOptions = [
    { key: "halfDay", label: "نص يوم" },
    { key: "oneDay", label: "يوم" },
    { key: "twoDays", label: "يومين" },
    { key: "threeDays", label: "3 أيام" },
    { key: "fiveDays", label: "5 أيام" },
    { key: "tenDays", label: "10 أيام" },
  ];
  constructor(
    private api: Apiservice,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadEmployees();
    this.loadBranches();
    this.loadBanks();
    this.loadCriteria();
  }

  openMenu(event: Event, emp: any) {
    this.selectedEmployee = emp;
    this.activeEmployeeId = emp.id;
    this.menu.toggle(event);
  }

  employeeActions = [
    {
      label: "إضافة زيادة",
      icon: "pi pi-plus-circle",
      command: () => {
        this.openActionDialog("bonus", "إضافة زيادة", this.selectedEmployee);
      },
    },

    {
      label: "إضافة سلفة",
      icon: "pi pi-wallet",
      command: () => {
        this.openActionDialog("borrow", "إضافة سلفة", this.selectedEmployee);
      },
    },

    {
      label: "إضافة خصم",
      icon: "pi pi-minus-circle",
      command: () => {
        this.openActionDialog("discount", "إضافة خصم", this.selectedEmployee);
      },
    },

    {
      label: "إضافة خصم تعاقدات",
      icon: "pi pi-file-edit",
      command: () => {
        this.openActionDialog(
          "contract",
          "إضافة خصم تعاقدات",
          this.selectedEmployee,
        );
      },
    },

    {
      label: "إضافة سلفة نقدية",
      icon: "pi pi-money-bill",
      command: () => {
        this.openActionDialog(
          "cashBorrow",
          "إضافة سلفة نقدية",
          this.selectedEmployee,
        );
      },
    },
    {
      label: "إضافة تقييم",
      icon: "pi pi-star",
      command: () => {
        this.openActionDialog(
          "evaluation",
          "إضافة تقييم",
          this.selectedEmployee,
        );
      },
    },
    {
      label: "إضافة عهدة",
      icon: "pi pi-box",
      command: () => {
        this.openActionDialog(
          "responsibility",
          "إضافة عهدة",
          this.selectedEmployee,
        );
      },
    },
  ];

  loadEmployees() {
    this.loading = true;

    this.api.getAllEmployees(this.page, this.pageSize).subscribe({
      next: (res: any) => {
        this.employees = res.data;
        this.totalRecords = res.totalCount;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onPageChange(event: any): void {
    this.page = event.first / event.rows + 1;
    this.pageSize = event.rows;
    this.loadEmployees();
  }

  getEmployeeName(id: number): string {
    return this.employees.find((e: any) => e.id === id)?.name ?? "";
  }

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedEmployeeIds = checked ? this.employees.map((e) => e.id) : [];
  }

  loadBranches() {
    this.api.getAllBranches(1, 100).subscribe({
      next: (res: any) => {
        this.branches = res.data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.api.showError("حدث خطأ أثناء تحميل الفروع");
      },
    });
  }

  loadBanks() {
    this.loading = true;
    this.api.getAllBanks().subscribe({
      next: (res: any) => {
        this.banks = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadCriteria() {
    this.loading = true;
    this.api.getAllCriteria(this.page, 20).subscribe({
      next: (res: any) => {
        this.Criteria = res.data;
        console.log(this.Criteria);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

editEmployee(emp: any) {
  this.isEditMode = true;
  this.showPayrollDetails = false;
  this.loadingResponsibilities = true;

  forkJoin({
    history: this.api.getHistoryByEmployeeId(emp.id),
    employee: this.api.getEmployeeById(emp.id),
    payroll: this.api.getMonthyDataForuser(emp.id),
    responsibilities: this.api.getAllResponsibilities(emp.id),
  }).subscribe({
    next: (res: any) => {
      this.employeeDetails = {
        ...res.history,
        ...res.employee,
        ...res.payroll,
        responsibilities: res.responsibilities,
        hiringDate: res.employee.hiringDate
          ? new Date(res.employee.hiringDate)
          : null,
      };
      this.loadingResponsibilities = false;
      this.showEmployeeDetailsDialog = true;
      this.cdr.detectChanges();
    },
    error: () => {
      this.loadingResponsibilities = false;
      this.api.showError("حدث خطأ أثناء تحميل بيانات الموظف");
    },
  });
}
  saveEmployeeEdits() {
    const payload = {
      theNameOfJob: this.employeeDetails.theNameOfJob,
      bankId: this.employeeDetails.bankId,
      bankName: this.employeeDetails.bankName,
      bankAccount: this.employeeDetails.bankAccount,
      shiftHours: this.employeeDetails.shiftHours,
      branchId: this.employeeDetails.branchId,
      hiringDate: this.employeeDetails.hiringDate,
      qualification: this.employeeDetails.qualification,
      graduationYear: this.employeeDetails.graduationYear,
      nationalId: this.employeeDetails.nationalId,
      phoneNumber: this.employeeDetails.phoneNumber,
      EmployeeType: this.employeeDetails.EmployeeType,
    };

    this.api.editEmployee(this.employeeDetails.id, payload).subscribe({
      next: () => {
        const payrollPayload = {
          totalSalary: (this.employeeDetails.totalSalary = Number(
            this.employeeDetails.totalSalary?.toFixed(2),
          )),
          salaryPerHour: (this.employeeDetails.salaryPerHour = Number(
            this.employeeDetails.salaryPerHour?.toFixed(2),
          )),
          insurence: this.employeeDetails.insurence,
          hoursOverTime: this.employeeDetails.hoursOverTime,
          forgetedHours: this.employeeDetails.forgetedHours,
        };

        this.api
          .updateMonthlyDtataForUser(this.employeeDetails.id, payrollPayload)
          .subscribe({
            next: () => {
              this.api.showSuccess("تم حفظ جميع التعديلات بنجاح");

              this.showEmployeeDetailsDialog = false;

              this.loadEmployees();
            },

            error: (err) => {
              console.log(err);

              this.api.showError(
                "تم حفظ بيانات الموظف ولكن فشل تحديث بيانات المرتب",
              );
            },
          });
      },

      error: (err) => {
        console.log(err);

        this.api.showError("حدث خطأ أثناء حفظ بيانات الموظف");
      },
    });
  }

  submitEndService(emp: any) {
    if (!this.endServiceReason?.trim()) {
      this.api.showError("يجب إدخال سبب إنهاء الخدمة");
      return;
    }
    this.activeEmployeeId = emp.id;

    this.confirmationService.confirm({
      message: `هل أنت متأكد من إنهاء خدمة ${emp.name} نهائياً؟`,
      header: "تأكيد إنهاء الخدمة",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "نعم",
      rejectLabel: "إلغاء",
      acceptButtonStyleClass: "p-button-danger",

      accept: () => {
        const payload = {
          endOfServiceDate: new Date().toISOString(),
          endOfServiceReason: this.endServiceReason,
          endOfServiceType: this.endOfServiceType,
        };

        this.api.endOfServiceEmployee(emp.id, payload).subscribe({
          next: () => {
            this.api.showSuccess("تم إنهاء الخدمة بنجاح");
            emp.isActive = false;
            this.showEndServiceDialog = false;
            this.endServiceReason = "";
            this.cdr.detectChanges();
          },

          error: (err) => {
            this.api.showError("حدث خطأ أثناء إنهاء الخدمة");
          },
        });
      },
    });
  }

  openEndService(emp: any) {
    this.selectedEmployee = emp;
    this.endServiceReason = "";
    this.showEndServiceDialog = true;
    this.activeEmployeeId = emp.id;
  }

  openSchedule(emp: any) {
    this.selectedEmployeeId = emp.id;
    this.activeEmployeeId = emp.id;
    this.employeeName = emp.name;
    this.api.getScheduleByEmployeeId(emp.id).subscribe({
      next: (scheduleRes: any) => {
        this.employeeAttendance = (scheduleRes as any[]).map((item) => ({
          ...item,

          isEditing: false,
        }));
        this.showAttendanceDialog = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.api.showError("حدث خطأ أثناء تحميل جدول الموظف");
      },
    });
  }

  formatTime(time: string): string {
    if (!time) return "-";
    const [hours, minutes] = time.split(":");
    let hour = +hours;
    const period = hour >= 12 ? "مساءً" : "صباحاً";
    hour = hour % 12 || 12;
    return `${hour}:${minutes} ${period}`;
  }

  onEmployeeCreated() {
    this.showCreateEmployee = false;
    this.loadEmployees();
  }

  onPayrollFilterChange() {
    this.isCurrentMonth = this.payrollViewType === "current";

    if (this.isCurrentMonth) {
      this.selectedMonth = new Date().getMonth() + 1;
      this.selectedYear = new Date().getFullYear();
    }
  }

  reloadPayrollData() {
    if (!this.selectedEmployeeForPayroll) {
      return;
    }

    this.isCurrentMonth = this.payrollViewType === "current";
    this.showPayrollDetails = false;
    // keep dialog open while reloading
    this.showEmployeeDetailsDialog = true;
    if (this.payrollRequestSub) {
      this.payrollRequestSub.unsubscribe();
      this.payrollRequestSub = null;
    }
    this.loadEmployeeDetailsWithPayroll();
  }

  openEmployeeDetails(emp: any) {
    this.selectedEmployeeForPayroll = emp;
    // when explicitly opening details, default to current month
    this.payrollViewType = "current";
    this.isCurrentMonth = true;
    this.employeeName = emp.name;
    this.activeTabIndex = "0";
    // keep existing details until new data arrives
    // show dialog immediately so it doesn't 'disappear' on errors
    this.showEmployeeDetailsDialog = true;
    this.selectedMonth = new Date().getMonth() + 1;
    this.selectedYear = new Date().getFullYear();

    if (this.payrollRequestSub) {
      this.payrollRequestSub.unsubscribe();
      this.payrollRequestSub = null;
    }

    this.loadEmployeeDetailsWithPayroll();
  }

  loadEmployeeDetailsWithPayroll() {
    const emp = this.selectedEmployeeForPayroll;

    if (!emp) {
      return;
    }

    this.isEditMode = false;
    this.showPayrollFilterDialog = false;

    const payrollRequest = this.isCurrentMonth
      ? this.api.getMonthyDataForuser(emp.id)
      : this.api.getmonthlyDataForuserByMonth(
          emp.id,
          this.selectedMonth,
          this.selectedYear,
        );

    forkJoin({
      employee: this.api.getEmployeeById(emp.id),
      branchHistory: this.api.getEmployeeHistory(emp.id),
      employeHistory: this.api.getHistoryByEmployeeId(emp.id),
      evaluations: this.api.getEvaluations(emp.id),
      payroll: payrollRequest,
      responsibilities: this.api.getAllResponsibilities(emp.id),
    }).subscribe({
      next: (res: any) => {
        this.employeeDetails = {
          ...res.employee,
          ...res.payroll,
          ...res.employeHistory,
          employeeHistory: res.branchHistory,
          evaluations: res.evaluations,
          responsibilities: res.responsibilities,
        };

        this.showPayrollDetails = true;
        this.showEmployeeDetailsDialog = true;

        this.cdr.detectChanges();

        if (!this.isCurrentMonth) {
          this.api.showSuccess("تم تحميل بيانات المرتب بنجاح");
        }
      },

      error: () => {
        this.api.showError("لا يوجد بيانات لهذا الشهر");
      },
    });
  }

  addAttendance() {
    this.employeeAttendance.push({
      id: 0,
      employeeId: this.selectedEmployeeId || 0,
      dayOfWeek: null,
      checkInTime: "",
      checkOutTime: "",
      isEditing: true,
      isNew: true,
    });
  }

  createAttendance(item: any) {
    this.api
      .addScheduleByEmployeeId(this.selectedEmployeeId, {
        dayOfWeek: item.dayOfWeek,
        checkInTime: item.checkInTime,
        checkOutTime: item.checkOutTime,
      })
      .subscribe({
        next: (res: any) => {
          item.id = res.id;
          item.isNew = false;
          item.isEditing = false;
          this.cdr.detectChanges();
          this.api.showSuccess("تم إضافة اليوم بنجاح");
        },

        error: () => {
          this.api.showError("حدث خطأ أثناء إضافة اليوم");
        },
      });
  }

  deleteAttendance(emp: any) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف هذا المعياد`,
      header: "تأكيد الحذف",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "نعم",
      rejectLabel: "إلغاء",
      acceptButtonStyleClass: "p-button-danger",
      accept: () => {
        this.api
          .deleteScheduleByEmployeeIdAndId(emp.employeeId, emp.id)
          .subscribe({
            next: () => {
              this.employeeAttendance = this.employeeAttendance.filter(
                (x) => x !== emp,
              );
              this.cdr.detectChanges();
              this.api.showSuccess("تم حذف الميعاد بنجاح");
            },
            error: () => {
              this.api.showError("حدث خطأ أثناء حذف الميعاد");
            },
          });
      },
    });
  }

  editAttendance(item: any) {
    item.originalData = { ...item };
    item.isEditing = true;
  }

  saveAttendance(item: any) {
    item.isEditing = false;
    this.api
      .updateScheduleByEmployeeId(item.employeeId, item.id, {
        dayOfWeek: item.dayOfWeek,
        checkInTime: item.checkInTime,
        checkOutTime: item.checkOutTime,
      })
      .subscribe({
        next: () => {
          this.api.showSuccess("تم تعديل الميعاد بنجاح");
          this.loadEmployees();
          this.cdr.detectChanges();
        },
        error: () => {
          this.api.showError("حدث خطأ أثناء تعديل الميعاد");
        },
      });
  }

  cancelEditAttendance(item: any) {
    if (item.isNew) {
      this.employeeAttendance = this.employeeAttendance.filter(
        (x) => x !== item,
      );

      return;
    }
    Object.assign(item, item.originalData);
    item.isEditing = false;
  }

  onSearchTermChange() {
    if (!this.searchTerm.trim()) {
      this.loadEmployees();
      return;
    }

    this.api
      .getAllEmployessByName(this.page, this.pageSize, this.searchTerm)
      .subscribe({
        next: (res: any) => {
          this.employees = res.data ?? res;
          this.totalRecords = res.totalCount ?? this.employees.length;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  clearSearch() {
    this.searchTerm = "";
    this.loadEmployees();
  }

  exportToExcel() {}

  openActionDialog(type: string, title: string, employee: any) {
    this.currentActionType = type;
    this.currentActionTitle = title + "  " + employee.name;
    this.actionSubType = "amount";
    this.selectedSingleDay = "";
    this.deductionCalcData = [];
    this.actionForm = {
      employeeId: employee.id,
      amount: null,
      reasonOfDiscount: "",
      notes: "",
      responsibilityName: "",
    };

    if (type === "evaluation") {
      this.actionForm = {
        employeeId: employee.id,
        quarter: "Q1",
        year: new Date().getFullYear(),
        results: [
          {
            evaluationCriteriaId: null,
            rating: "",
          },
        ],
      };
      this.actionItems = this.employeeDetails?.evaluations || [];
    }

    switch (type) {
      case "bonus":
        this.actionItems = this.employeeDetails?.bonuses || [];
        break;

      case "borrow":
        this.actionItems = this.employeeDetails?.borrows || [];
        break;

      case "discount":
        this.actionItems = this.employeeDetails?.discounts || [];
        break;

      case "contract":
        this.actionItems = this.employeeDetails?.contractDiscounts || [];
        break;

      case "cashBorrow":
        this.actionItems = this.employeeDetails?.cashBorrows || [];
        break;
    }

    this.actionDialogVisible = true;
  }

  onActionSubTypeChange(): void {
    this.actionForm.amount = null;
    this.selectedSingleDay = "";
    this.deductionCalcData = [];

    if (this.actionSubType === "days") {
      // بنبعت الـ employeeId الواحد
      this.loadingDeductionCalc = true;
      this.api
        .addDeductionCalculator({ employeeIds: [this.actionForm.employeeId] })
        .subscribe({
          next: (data: any) => {
            this.deductionCalcData = data ?? [];
            this.loadingDeductionCalc = false;
            this.cdr.detectChanges();
          },
          error: () => (this.loadingDeductionCalc = false),
        });
    }
  }

  getDeductionValue(key: string): number {
    const deductions = this.deductionCalcData[0]?.deductions;
    if (!deductions) return 0;
    return deductions[key as keyof typeof deductions] ?? 0;
  }

  onSingleDaySelect(): void {
    if (!this.deductionCalcData.length || !this.selectedSingleDay) return;
    const deductions = this.deductionCalcData[0].deductions;
    const key = this.selectedSingleDay as keyof typeof deductions;
    this.actionForm.amount = Math.round(deductions[key]);
  }

  addEvaluationRow() {
    this.evaluationResults.push({ evaluationCriteriaId: 0, rating: "" });
  }

  removeEvaluationRow(index: number) {
    this.evaluationResults.splice(index, 1);
  }

  saveAction() {
    // ===== Evaluation =====
    if (this.currentActionType === "evaluation") {
      if (!this.actionForm.quarter || !this.actionForm.year) {
        this.api.showError("يجب إدخال الربع والسنة");
        return;
      }

      if (!this.evaluationResults.length) {
        this.api.showError("يجب إضافة بند تقييم واحد على الأقل");
        return;
      }

      const invalidResult = this.evaluationResults.some(
        (x) => !x.evaluationCriteriaId || !x.rating,
      );

      if (invalidResult) {
        this.api.showError("يجب استكمال جميع معايير التقييم");
        return;
      }

      this.actionLoading = true;

      const evaluationPayload = {
        employeeId: this.actionForm.employeeId,
        quarter: this.actionForm.quarter,
        year: this.actionForm.year,
        results: this.evaluationResults.map((r) => ({
          evaluationCriteriaId: r.evaluationCriteriaId,
          rating: r.rating,
        })),
      };

      this.api.addEvaluations(evaluationPayload).subscribe({
        next: (res: any) => {
          this.actionItems.unshift(res);
          this.actionLoading = false;
          this.actionDialogVisible = false;
          this.evaluationResults = [];
          this.api.showSuccess("تم إضافة التقييم بنجاح");
          this.loadEmployeeDetailsWithPayroll();
          this.cdr.detectChanges();
        },
        error: () => {
          this.actionLoading = false;
          this.api.showError("حدث خطأ أثناء حفظ التقييم");
        },
      });

      return;
    }

    if (this.currentActionType === "responsibility") {
      if (!this.actionForm.responsibilityName?.trim()) {
        this.api.showError("يجب إدخال اسم العهدة");
        return;
      }
      this.actionLoading = true;
      this.api
        .addResponsibility(this.actionForm.employeeId, {
          name: this.actionForm.responsibilityName,
        })
        .subscribe({
          next: (res: any) => {
            this.actionLoading = false;
            this.actionDialogVisible = false;
            this.actionForm.responsibilityName = "";
            if (this.employeeDetails) {
              this.employeeDetails.responsibilities = [
                ...(this.employeeDetails.responsibilities || []),
                res,
              ];
            }
            this.api.showSuccess("تم إضافة العهدة بنجاح");
            this.cdr.detectChanges();
          },
          error: () => {
            this.actionLoading = false;
            this.api.showError("حدث خطأ أثناء إضافة العهدة");
          },
        });
      return;
    }

    // ===== باقى الأنواع =====
    if (
      !this.actionForm.amount ||
      !this.actionForm.reasonOfDiscount?.trim() ||
      !this.actionForm.notes?.trim()
    ) {
      this.api.showError("يجب إدخال القيمة والسبب والملاحظات");
      return;
    }

    this.actionLoading = true;

    const payload =
      this.currentActionType === "bonus" || this.currentActionType === "borrow"
        ? {
            employeeId: this.actionForm.employeeId,
            amount: this.actionForm.amount,
            reason: this.actionForm.reasonOfDiscount,
            notes: this.actionForm.notes,
          }
        : {
            employeeId: this.actionForm.employeeId,
            amount: this.actionForm.amount,
            reasonOfDiscount: this.actionForm.reasonOfDiscount,
            notes: this.actionForm.notes,
          };

    const request =
      this.currentActionType === "bonus"
        ? this.api.addBonus(payload)
        : this.currentActionType === "borrow"
          ? this.api.addCashBorrow(payload)
          : this.currentActionType === "discount"
            ? this.api.addDiscount(payload)
            : this.api.addContractDiscount(payload);

    request.subscribe({
      next: (res: any) => {
        this.actionItems.unshift(res);
        this.actionForm = {
          employeeId: this.actionForm.employeeId,
          amount: null,
          reasonOfDiscount: "",
          notes: "",
        };
        this.actionLoading = false;
        this.cdr.detectChanges();
        this.api.showSuccess("تمت الإضافة بنجاح");
        this.actionDialogVisible = false;
      },
      error: () => {
        this.actionLoading = false;
        this.api.showError("حدث خطأ أثناء الحفظ");
      },
    });
  }

  deleteAction(id: number, type?: string) {
    const actionType = type || this.currentActionType;

    this.confirmationService.confirm({
      header: "تأكيد الحذف",
      message: "هل أنت متأكد من حذف هذا البند؟",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "حذف",
      rejectLabel: "إلغاء",
      acceptButtonStyleClass: "p-button-danger",

      accept: () => {
        const request =
          actionType === "bonus"
            ? this.api.deleteBonus(id)
            : actionType === "borrow" || actionType === "cashBorrow"
              ? this.api.deleteCashBorrow(id)
              : actionType === "discount"
                ? this.api.deleteDiscount(id)
                : actionType === "contract"
                  ? this.api.deleteContractDiscount(id)
                  : this.api.deleteCashBorrow(id);

        request.subscribe({
          next: () => {
            this.actionItems = this.actionItems.filter((x: any) => x.id !== id);
            this.cdr.detectChanges();
            this.api.showSuccess("تم الحذف بنجاح");
            this.loadEmployeeDetailsWithPayroll();
          },

          error: () => {
            this.api.showError("حدث خطأ أثناء الحذف");
          },
        });
      },
    });
  }

  onFilterChange() {
    const hasBranch = !!this.selectedBranchFilter;
    const hasBank = !!this.selectedBankFilter;
    const hasRole = !!this.selectedRoleFilter;

    if (hasBranch && hasBank && hasRole) {
      this.api
        .getAllEmployessWithAllFilters(
          this.page,
          this.pageSize,
          this.selectedBranchFilter,
          this.selectedBankFilter,
          this.selectedRoleFilter,
        )
        .subscribe({
          next: (res: any) => {
            this.employees = res.data ?? res;
            this.totalRecords = res.totalCount ?? this.employees.length;
            this.cdr.detectChanges();
          },
        });
      return;
    }

    // لو فرع فقط
    if (hasBranch && !hasBank && !hasRole) {
      this.api
        .getAllEmployeesByBranch(
          this.page,
          this.pageSize,
          this.selectedBranchFilter,
        )
        .subscribe({
          next: (res: any) => {
            this.employees = res.data ?? res;
            this.totalRecords = res.totalCount ?? this.employees.length;
            this.cdr.detectChanges();
          },
        });
      return;
    }

    // لو بنك فقط
    if (hasBank && !hasBranch && !hasRole) {
      this.api
        .gettAllEmployessByBank(
          this.page,
          this.pageSize,
          this.selectedBankFilter,
        )
        .subscribe({
          next: (res: any) => {
            this.employees = res.data ?? res;
            this.totalRecords = res.totalCount ?? this.employees.length;
            this.cdr.detectChanges();
          },
        });
      return;
    }

    // لو دور فقط
    if (hasRole && !hasBranch && !hasBank) {
      this.api
        .getAllEmployessByRole(
          this.page,
          this.pageSize,
          this.selectedRoleFilter,
        )
        .subscribe({
          next: (res: any) => {
            this.employees = res.data ?? res;
            this.totalRecords = res.totalCount ?? this.employees.length;
            this.cdr.detectChanges();
          },
        });
      return;
    }

    this.loadEmployees();
  }

  resetFilters() {
    this.selectedBranchFilter = "";
    this.selectedBankFilter = "";
    this.selectedRoleFilter = "";
    this.loadEmployees();
  }

  toggleGroupMode() {
    this.showGroupMode = !this.showGroupMode;
    this.selectedEmployeeIds = [];
    if (!this.showGroupMode) {
      this.showGroupDialog = false;
    }
  }

  toggleEmployeeSelection(empId: number) {
    const index = this.selectedEmployeeIds.indexOf(empId);
    if (index === -1) {
      this.selectedEmployeeIds.push(empId);
    } else {
      this.selectedEmployeeIds.splice(index, 1);
    }
  }

  isEmployeeSelected(empId: number): boolean {
    return this.selectedEmployeeIds.includes(empId);
  }

  openGroupDialog() {
    if (!this.selectedEmployeeIds.length) return;
    this.groupAmount = 0;
    this.groupReason = "";
    this.groupNotes = "";
    this.groupActionType = "bonus";
    this.showGroupDialog = true;
    this.groupSubType = "amount";
  }

  saveGroup() {
    if (this.groupSubType === "days") {
      // بناء الـ payload من selectedDayPerEmployee
      const variedPayload = this.deductionCalcData.map((row) => {
        const dayKey = this.selectedDayPerEmployee[
          row.employeeId
        ] as keyof typeof row.deductions;
        return {
          employeeId: row.employeeId,
          amount: Math.round(row.deductions[dayKey]),
          reason: this.groupReason,
          notes: this.groupNotes || null,
        };
      });

      const call$ =
        this.groupActionType === "bonus"
          ? this.api.addBulkVariedBonus(variedPayload)
          : this.groupActionType === "discount"
            ? this.api.addBulkVariedDiscount(variedPayload)
            : this.api.addBulkVariedContractDiscount(variedPayload);

      call$.subscribe({
        next: () => {
          this.showGroupDialog = false;
          this.showGroupMode = false;
          this.selectedEmployeeIds = [];
          this.deductionCalcData = [];
          this.selectedDayPerEmployee = {};
          this.cdr.detectChanges();
          this.api.showSuccess("تم الإضافة بنجاح");
        },
        error: (err) => console.error(err),
      });
    } else {
      // بقيمة — المنطق الموجود
      const payload = {
        employeeIds: this.selectedEmployeeIds,
        amount: this.groupAmount,
        reason: this.groupReason,
        notes: this.groupNotes || null,
      };

      const call$ =
        this.groupActionType === "bonus"
          ? this.api.addBulkBonus(payload)
          : this.groupActionType === "discount"
            ? this.api.addBulkDiscount(payload)
            : this.api.addBulkVariedContractDiscount(payload);

      call$.subscribe({
        next: () => {
          this.showGroupDialog = false;
          this.showGroupMode = false;
          this.selectedEmployeeIds = [];
          this.cdr.detectChanges();
          this.api.showSuccess("تم الإضافة بنجاح");
        },
        error: (err) => console.error(err),
      });
    }
  }

  // ── عند تغيير نوع القيمة ────────────────────────────────────────────────────
  onSubTypeChange(): void {
    this.groupAmount = null;
    this.deductionCalcData = [];
    this.selectedDayPerEmployee = {};

    if (this.groupSubType === "days" && this.selectedEmployeeIds.length) {
      this.loadDeductionCalculator();
    }
  }

  loadDeductionCalculator(): void {
    this.loadingDeductionCalc = true;
    this.api
      .addDeductionCalculator({ employeeIds: this.selectedEmployeeIds })
      .subscribe({
        next: (data: any) => {
          this.deductionCalcData = data ?? [];
          this.loadingDeductionCalc = false;
          this.cdr.detectChanges();
        },
        error: () => (this.loadingDeductionCalc = false),
      });
  }

  // ── validation ───────────────────────────────────────────────────────────────
  isSaveGroupValid(): boolean {
    if (!this.groupReason) return false;
    if (this.groupSubType === "amount") return !!this.groupAmount;
    return this.deductionCalcData.every(
      (row) => !!this.selectedDayPerEmployee[row.employeeId],
    );
  }

  deleteResponsibility(item: any) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف عهدة "${item.name}"؟`,
      header: "تأكيد الحذف",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "حذف",
      rejectLabel: "إلغاء",
      acceptButtonStyleClass: "p-button-danger",
      accept: () => {
        this.api.deleteResponsibility(item.employeeId, item.id).subscribe({
          next: () => {
            this.employeeDetails.responsibilities =
              this.employeeDetails.responsibilities.filter(
                (r: any) => r.id !== item.id,
              );
            this.cdr.detectChanges();
            this.api.showSuccess("تم حذف العهدة بنجاح");
          },
          error: () => {
            this.api.showError("حدث خطأ أثناء حذف العهدة");
          },
        });
      },
    });
  }
}
