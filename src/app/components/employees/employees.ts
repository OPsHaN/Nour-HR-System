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
  constructor(
    private api: Apiservice,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadEmployees();
    this.loadBranches();
    this.loadBanks();
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
  ];

  loadEmployees() {
    this.loading = true;

    this.api.getAllEmployees(this.page, this.pageSize).subscribe({
      next: (res: any) => {
        this.employees = res.data;
        this.totalRecords = res.totalCount;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadBranches() {
    this.api.getAllBranches(1, 100).subscribe({
      next: (res: any) => {
        this.branches = res.data;
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
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  editEmployee(emp: any) {
    this.isEditMode = true;
    this.showPayrollDetails = false;
    this.api.getHistoryByEmployeeId(emp.id).subscribe({
      next: (historyRes) => {
        this.api.getEmployeeById(emp.id).subscribe({
          next: (employeeRes) => {
            this.api.getMonthyDataForuser(emp.id).subscribe({
              next: (payrollRes) => {
                this.employeeDetails = {
                  ...historyRes,
                  ...employeeRes,
                  ...payrollRes,
                };
              },
            });

            this.employeeDetails.hiringDate = this.employeeDetails.hiringDate
              ? new Date(this.employeeDetails.hiringDate)
              : null;
            this.cdr.detectChanges();
            this.showEmployeeDetailsDialog = true;
          },
        });
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

  // loadEmployeeDetailsWithPayroll() {
  //   const emp = this.selectedEmployeeForPayroll;
  //   if (!emp) {
  //     return;
  //   }

  //   this.isEditMode = false;
  //   this.showPayrollFilterDialog = false;
  //   this.api.getHistoryByEmployeeId(emp.id).subscribe({
  //     next: (historyRes) => {
  //       this.api.getEmployeeById(emp.id).subscribe({
  //         next: (employeeRes) => {
  //           // Current Month
  //           if (this.isCurrentMonth) {
  //             if (this.payrollRequestSub) {
  //               this.payrollRequestSub.unsubscribe();
  //               this.payrollRequestSub = null;
  //             }
  //             this.payrollRequestSub = this.api
  //               .getMonthyDataForuser(emp.id)
  //               .subscribe({
  //                 next: (payrollRes) => {
  //                   this.employeeDetails = {
  //                     ...historyRes,
  //                     ...employeeRes,
  //                     ...payrollRes,
  //                   };
  //                   this.showPayrollDetails = true;
  //                   this.showEmployeeDetailsDialog = true;
  //                   this.cdr.detectChanges();
  //                   this.payrollRequestSub = null;
  //                   // this.api.showSuccess("تم تحميل بيانات الموظف بنجاح");
  //                 },
  //                 error: () => {
  //                   this.api.showError("لا يوجد بيانات لهذا الشهر");
  //                   this.payrollRequestSub = null;
  //                 },
  //               });
  //           }
  //           // Selected Month / Year
  //           else {
  //             if (this.payrollRequestSub) {
  //               this.payrollRequestSub.unsubscribe();
  //               this.payrollRequestSub = null;
  //             }
  //             this.payrollRequestSub = this.api
  //               .getmonthlyDataForuserByMonth(
  //                 emp.id,
  //                 this.selectedMonth,
  //                 this.selectedYear,
  //               )
  //               .subscribe({
  //                 next: (payrollRes) => {
  //                   this.employeeDetails = {
  //                     ...historyRes,
  //                     ...employeeRes,
  //                     ...payrollRes,
  //                   };
  //                   this.showPayrollDetails = true;
  //                   this.showEmployeeDetailsDialog = true;
  //                   this.cdr.detectChanges();
  //                   this.payrollRequestSub = null;
  //                   this.api.showSuccess("تم تحميل بيانات المرتب بنجاح");
  //                 },
  //                 error: () => {
  //                   this.api.showError("لا يوجد بيانات لهذا الشهر");
  //                   this.payrollRequestSub = null;
  //                 },
  //               });
  //           }
  //         },
  //         error: () => {
  //           this.api.showError("حدث خطأ أثناء تحميل بيانات الموظف");
  //         },
  //       });
  //     },
  //     error: () => {
  //       this.api.showError("حدث خطأ أثناء تحميل بيانات الموظف");
  //     },
  //   });
  // }

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
      history: this.api.getEmployeeHistory(emp.id),
      evaluations: this.api.getEvaluations(emp.id),
      payroll: payrollRequest,
    }).subscribe({
      next: (res: any) => {
        this.employeeDetails = {
          ...res.employee,
          ...res.payroll,

          employeeHistory: res.history,
          evaluations: res.evaluations,
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

  deleteAttendance(emp: any) {
    console.log(emp);
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
              this.api.showSuccess("تم حذف الميعاد بنجاح");
            },
            error: () => {
              this.api.showError("حدث خطأ أثناء حذف الميعاد");
            },
          });
      },
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
          this.api.showSuccess("تم إضافة اليوم بنجاح");
        },

        error: () => {
          this.api.showError("حدث خطأ أثناء إضافة اليوم");
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
  }

  exportToExcel() {}

  openActionDialog(type: string, title: string, employee: any) {
    this.currentActionType = type;

    this.currentActionTitle = title + "  " + employee.name;

    this.actionForm = {
      employeeId: employee.id,
      amount: null,
      reasonOfDiscount: "",
      notes: "",
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

  addEvaluationRow() {
    this.actionForm.results.push({
      evaluationCriteriaId: null,
      rating: "",
    });
  }

  removeEvaluationRow(index: number) {
    this.actionForm.results.splice(index, 1);
  }

  saveAction() {
    // Evaluation

    if (this.currentActionType === "evaluation") {
      if (
        this.actionForm.quarter == null ||
        this.actionForm.quarter === "" ||
        this.actionForm.year == null ||
        this.actionForm.year === "" ||
        !this.actionForm.results?.length
      ) {
        this.api.showError("يجب إدخال بيانات التقييم");

        return;
      }

      const invalidResult = this.actionForm.results.some(
        (x: any) => !x.evaluationCriteriaId || !x.rating,
      );

      if (invalidResult) {
        this.api.showError("يجب استكمال جميع معايير التقييم");

        return;
      }

      this.actionLoading = true;

      this.api.addEvaluations(this.actionForm).subscribe({
        next: (res: any) => {
          this.actionItems.unshift(res);

          this.actionLoading = false;

          this.actionDialogVisible = false;

          this.api.showSuccess("تم إضافة التقييم بنجاح");

          this.loadEmployeeDetailsWithPayroll();
        },

        error: () => {
          this.actionLoading = false;

          this.api.showError("حدث خطأ أثناء حفظ التقييم");
        },
      });

      return;
    }

    // Validation لباقى الأنواع

    if (
      !this.actionForm.amount ||
      !this.actionForm.reasonOfDiscount?.trim() ||
      !this.actionForm.notes?.trim()
    ) {
      this.api.showError("يجب إدخال القيمة والسبب والملاحظات");

      return;
    }

    this.actionLoading = true;

    // Dynamic Payload

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

    // Dynamic Request

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

        this.api.showSuccess("تمت الإضافة بنجاح");
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
}
