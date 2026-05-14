import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ConfirmationService } from "primeng/api";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { Apiservice } from "src/app/services/api.service";
import { CreateEmployee } from "../create-employee/create-employee";

@Component({
  selector: "app-employees",
  imports: [TableModule, TagModule, FormsModule, CommonModule, CreateEmployee],
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

  confirmDelete(emp: any) {
    this.confirmationService.confirm({
      message: "هل أنت متأكد من حذف الموظف",
      header: "تأكيد الحذف",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "نعم",
      rejectLabel: "إلغاء",

      accept: () => {
        this.deleteEmployee(emp.id);
      },
    });
  }

  deleteEmployee(id: string) {
    console.log("Deleted ID:", id);
    // API CALL
    // this.api.deleteUser(id).subscribe(...)
  }

  viewDetails(emp: any) {
    this.api.getEmployeeById(emp.id).subscribe({
      next: (res) => {
        console.log("Employee Details:", res);
      },
      error: (err) => {
        console.error("Error fetching employee details:", err);
      },
    });
  }

    onEmployeeCreated() {
    this.showCreateEmployee = false;
    this.loadEmployees();
  }
}
