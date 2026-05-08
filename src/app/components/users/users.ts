import { Component } from "@angular/core";
import { Apiservice } from "src/app/services/api.service";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { ConfirmationService } from 'primeng/api';
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

  constructor(private api: Apiservice , private confirmationService: ConfirmationService) {}

  ngOnInit(): void {
    this.getEmployees();
  }

  getEmployees() {
    this.api.getAllUsers(1, 10).subscribe({
      next: (res: any) => {
        this.users = res.data || [];
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
