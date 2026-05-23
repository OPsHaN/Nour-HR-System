import { Component } from "@angular/core";
import { ChangeDetectorRef } from "@angular/core";
import { Apiservice } from "src/app/services/api.service";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { ConfirmationService } from "primeng/api";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CreateUser } from "../create-user/create-user";

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  isActive: boolean;
}

@Component({
  selector: "app-users",
  imports: [TableModule, TagModule, FormsModule, CommonModule, CreateUser],
  templateUrl: "./users.html",
  styleUrl: "./users.css",
})
export class Users {
  users: User[] = [];
  totalRecords = 0;
  page = 1;
  pageSize = 10;
  showCreateUser: boolean = false;
  showPassword = false;
  editingRowKeys: { [key: string]: boolean } = {};

  constructor(
    private api: Apiservice,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.getEmployees();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  getEmployees() {
    this.api.getAllUsers(1, 10).subscribe({
      next: (res: any) => {
        this.users = res.data || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  onRowEditSave(emp: any) {
    // update user data
    this.api.changePassword(emp.id, emp.password).subscribe({
      next: () => {
        this.api.showSuccess("تم تغيير كلمة المرور");
        emp.password = "";
        delete this.editingRowKeys[emp.id];
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.api.showError("فشل تغيير كلمة المرور");
        console.error(err);
      },
    });
  }

  confirmDelete(emp: any) {
    this.confirmationService.confirm({
      message: "هل أنت متأكد من حذف المستخدم؟",
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

  onEmployeeCreated() {
    this.showCreateUser = false;
    this.getEmployees();
  }

  onStatusChange(emp: any) {
    this.api.changeStatus(emp.id, emp.isActive).subscribe({
      next: () => {
        this.api.showSuccess("تم تغيير الحالة بنجاح");
        this.cdr.detectChanges();
        delete this.editingRowKeys[emp.id];
      },
      error: (err) => {
        this.api.showError("حدث خطأ أثناء تغيير الحالة");

        // rollback لو حصل error
        emp.isActive = !emp.isActive;

        console.error(err);
      },
    });
  }
}
