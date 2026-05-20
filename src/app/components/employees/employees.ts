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
import { Subscription } from "rxjs";

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
        this.openAddBonus(this.selectedEmployee);
      },
    },

    {
      label: "إضافة سلفة",
      icon: "pi pi-wallet",

      command: () => {
        this.openAddAdvance(this.selectedEmployee);
      },
    },

    {
      label: "إضافة خصم",
      icon: "pi pi-minus-circle",

      command: () => {
        this.openAddDeduction(this.selectedEmployee);
      },
    },

    {
      label: "إضافة خصم تعاقدات",
      icon: "pi pi-file-edit",

      command: () => {
        this.openContractDeduction(this.selectedEmployee);
      },
    },

    {
      label: "إضافة سلفة نقدية",
      icon: "pi pi-money-bill",

      command: () => {
        this.openCashAdvance(this.selectedEmployee);
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
        console.log(historyRes);
        this.api.getEmployeeById(emp.id).subscribe({
          next: (employeeRes) => {
            this.employeeDetails = {
              ...historyRes,
              ...employeeRes,
            };

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
        this.api.showSuccess("تم حفظ التعديلات بنجاح");
        this.showEmployeeDetailsDialog = false;
        this.loadEmployees();
      },
      error: () => {
        this.api.showError("حدث خطأ أثناء حفظ التعديلات");
      },
    });
    // api call here
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

        this.api.showSuccess("تم تحميل جدول الموظف بنجاح");
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

  // openEmployeeDetails(emp: any) {
  //   this.isEditMode = false;
  //   this.api.getHistoryByEmployeeId(emp.id).subscribe({
  //     next: (historyRes) => {
  //       this.api.getEmployeeById(emp.id).subscribe({
  //         next: (employeeRes) => {
  //           this.api.getMonthyDataForuser(emp.id).subscribe({
  //             next: (payrollRes) => {
  //               console.log(payrollRes);
  //               this.employeeDetails = {
  //                 ...historyRes,
  //                 ...employeeRes,
  //                 ...payrollRes,
  //               };
  //             },
  //           });

  //           this.showEmployeeDetailsDialog = true;
  //           this.cdr.detectChanges();
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
    this.api.getHistoryByEmployeeId(emp.id).subscribe({
      next: (historyRes) => {
        this.api.getEmployeeById(emp.id).subscribe({
          next: (employeeRes) => {
            // Current Month
            if (this.isCurrentMonth) {
              if (this.payrollRequestSub) {
                this.payrollRequestSub.unsubscribe();
                this.payrollRequestSub = null;
              }
              this.payrollRequestSub = this.api
                .getMonthyDataForuser(emp.id)
                .subscribe({
                  next: (payrollRes) => {
                    this.employeeDetails = {
                      ...historyRes,
                      ...employeeRes,
                      ...payrollRes,
                    };
                    this.showPayrollDetails = true;
                    this.showEmployeeDetailsDialog = true;
                    this.cdr.detectChanges();
                    this.payrollRequestSub = null;
                    // this.api.showSuccess("تم تحميل بيانات الموظف بنجاح");
                  },
                  error: () => {
                    this.api.showError("لا يوجد بيانات لهذا الشهر");
                    this.payrollRequestSub = null;
                  },
                });
            }
            // Selected Month / Year
            else {
              if (this.payrollRequestSub) {
                this.payrollRequestSub.unsubscribe();
                this.payrollRequestSub = null;
              }
              this.payrollRequestSub = this.api
                .getmonthlyDataForuserByMonth(
                  emp.id,
                  this.selectedMonth,
                  this.selectedYear,
                )
                .subscribe({
                  next: (payrollRes) => {
                    this.employeeDetails = {
                      ...historyRes,
                      ...employeeRes,
                      ...payrollRes,
                    };
                    this.showPayrollDetails = true;
                    this.showEmployeeDetailsDialog = true;
                    this.cdr.detectChanges();
                    this.payrollRequestSub = null;
                    this.api.showSuccess("تم تحميل بيانات المرتب بنجاح");
                  },
                  error: () => {
                    this.api.showError("لا يوجد بيانات لهذا الشهر");
                    this.payrollRequestSub = null;
                  },
                });
            }
          },
          error: () => {
            this.api.showError("حدث خطأ أثناء تحميل بيانات الموظف");
          },
        });
      },
      error: () => {
        this.api.showError("حدث خطأ أثناء تحميل بيانات الموظف");
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

  openAddDeduction(emp: any) {}

  openAddBonus(emp: any) {}

  openAddAdvance(emp: any) {}

  openContractDeduction(emp: any) {}

  openCashAdvance(emp: any) {}
}
