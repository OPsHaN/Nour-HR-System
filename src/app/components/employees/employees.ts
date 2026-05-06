import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ConfirmationService } from "primeng/api";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { Apiservice } from "src/app/services/api.service";

@Component({
  selector: "app-employees",
  imports: [TableModule, TagModule, FormsModule, CommonModule],
  templateUrl: "./employees.html",
  styleUrl: "./employees.css",
})
export class Employees {
  employees: any[] = [];
  totalRecords = 0;
  page = 1;
  pageSize = 10;
  loading = false;

  constructor(
    private api: Apiservice,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit() {
  this.loadEmployees();
}

  loadEmployees() {
    this.loading = true;

      this.api.getAllEmployees(this.page , this.pageSize).subscribe({
      next: (res: any) => {
        this.employees = res.data;
        this.totalRecords = res.totalCount;
        this.loading = false;
        console.log(res);
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
