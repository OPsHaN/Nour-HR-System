import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ConfirmationService } from "primeng/api";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { Apiservice } from "src/app/services/api.service";
import { CreateEmployee } from "../create-employee/create-employee";
import { Dialog } from "primeng/dialog";

@Component({
  selector: "app-employees",
  imports: [
    TableModule,
    TagModule,
    FormsModule,
    CommonModule,
    CreateEmployee,
    Dialog,
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

  constructor(
    private api: Apiservice,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }

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

  editEmployee(emp: any) {
    this.selectedEmployee = emp;
    this.showCreateEmployee = true;
  }

  submitEndService(emp: any) {
    if (!this.endServiceReason?.trim()) {
      this.api.showError("يجب إدخال سبب إنهاء الخدمة");
      return;
    }

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
  }

  viewDetails(emp: any) {}

  onEmployeeCreated() {
    this.showCreateEmployee = false;
    this.loadEmployees();
  }

  openEmployeeDetails(emp: any) {
    this.api.getHistoryByEmployeeId(emp.id).subscribe({
      next: (historyRes) => {
        this.api.getEmployeeById(emp.id).subscribe({
          next: (employeeRes) => {
            this.employeeDetails = {
              ...historyRes,
              ...employeeRes,
            };

            this.showEmployeeDetailsDialog = true;
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
}
