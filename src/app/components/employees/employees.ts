import { Component } from "@angular/core";
import { Apiservice } from "src/app/services/api.service";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { ConfirmDialog } from "primeng/confirmdialog";
import { ConfirmationService } from 'primeng/api';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

interface Employee {
  id: string;
  name: string;
  username: string;
  role: string;
  isActive: boolean;
}

@Component({
  selector: "app-employees",
  imports: [TableModule, TagModule, ConfirmDialog , FormsModule , CommonModule],
  templateUrl: "./employees.html",
  styleUrl: "./employees.css",
})
export class Employees {
  employees: Employee[] = [];

  constructor(private api: Apiservice , private confirmationService: ConfirmationService) {}

  ngOnInit(): void {
    this.getEmployees();
  }

  getEmployees() {
    this.api.getAllUsers(1, 10).subscribe({
      next: (res: any) => {
        this.employees = res.data || [];
      },
      error: (err) => {
        console.error(err);
      },
    });
  }


  onRowEditSave(emp: any) {
  console.log('Updated:', emp);

  // API CALL
  // this.api.updateUser(emp.id, emp).subscribe(...)
}

  confirmDelete(emp: any) {
  this.confirmationService.confirm({
    message: 'هل أنت متأكد من حذف المستخدم؟',
    header: 'تأكيد الحذف',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'نعم',
    rejectLabel: 'إلغاء',

    accept: () => {
      this.deleteEmployee(emp.id);
    }
  });
}

  deleteEmployee(id: string) {
    console.log('Deleted ID:', id); 
    // API CALL
    // this.api.deleteUser(id).subscribe(...)
  }
}
