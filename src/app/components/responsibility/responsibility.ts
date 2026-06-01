import { CreateResponsibility } from "../create-responsibility/create-responsibility";
import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { ConfirmationService } from "primeng/api";
import { Apiservice } from "src/app/services/api.service";

@Component({
  selector: "app-responsibility",
  imports: [
    TableModule,
    TagModule,
    FormsModule,
    CommonModule,
    CreateResponsibility,
  ],
  templateUrl: "./responsibility.html",
  styleUrl: "./responsibility.css",
})

export class Responsibility {
  page = 1;
  pageSize = 10;
  loading = false;
  Responsibilities: any[] = [];
  showCreateResponsibility = false;


    constructor(
    private api: Apiservice,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadResponsibilities();
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
      },
    }); 
}

    onResponsibilityCreated() {
      this.showCreateResponsibility = false;
      this.loadResponsibilities();
    }

  confirmDelete(responsibility: any) {
    this.confirmationService.confirm({
      message: "هل أنت متأكد من حذف العهدة ؟",
      header: "تأكيد الحذف",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "نعم",
      rejectLabel: "لا",
      accept: () => {
        // this.deleteResponsibility(responsibility.id);
      },
    });
  }   


}
