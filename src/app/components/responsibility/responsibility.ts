import { CreateResponsibility } from "../create-responsibility/create-responsibility";
import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { ConfirmationService } from "primeng/api";
import { Apiservice } from "src/app/services/api.service";
import { SelectModule } from "primeng/select";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-responsibility",
  imports: [
    TableModule,
    TagModule,
    FormsModule,
    CommonModule,
    CreateResponsibility,
    SelectModule,
  ],
  templateUrl: "./responsibility.html",
  styleUrl: "./responsibility.css",
})
export class Responsibility {
  page = 1;
  pageSize = 10;
  loading = false;
  Responsibilities: any;
  showCreateResponsibility = false;
  selectedEmployeeId: string = "";
  employees: any[] = [];
  showSearchPanel = true;
  constructor(
    private api: Apiservice,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    public auth : AuthService,
  ) {}

  ngOnInit() {
    this.loadResponsibilities();
    this.loadEmployees();
  }

  get isEmployee(): boolean {
    return localStorage.getItem("role") === "Employee";
  }

  loadResponsibilities() {
    this.loading = true;
    const employeeId = localStorage.getItem("employeeId") || "";
    this.api.getAllResponsibilities(employeeId).subscribe({
      next: (res: any) => {
        this.Responsibilities = res;
        this.loading = false;
        this.cdr.detectChanges();
        console.log(res);
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadEmployees(): void {
    this.api.getAllEmployees(1, 999).subscribe({
      next: (res: any) => {
        this.employees = res.data;
        this.cdr.detectChanges();
      },
    });
  }

  Search() {
    if (!this.selectedEmployeeId) {
      return;
    }

    this.loading = true;
    this.api.getAllResponsibilities(this.selectedEmployeeId).subscribe({
      next: (data) => {
        this.Responsibilities = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onResponsibilityCreated() {
    this.showCreateResponsibility = false;
    this.loadResponsibilities();
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
            this.cdr.detectChanges();
            this.api.showSuccess("تم حذف العهدة بنجاح");
            this.loadResponsibilities();
          },
          error: () => {
            this.api.showError("حدث خطأ أثناء حذف العهدة");
          },
        });
      },
    });
  }
}
