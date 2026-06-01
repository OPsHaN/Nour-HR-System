import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { ChangeDetectorRef } from "@angular/core";
import { Apiservice } from "src/app/services/api.service";
import { SelectModule } from "primeng/select";

@Component({
  selector: "app-create-responsibility",
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SelectModule],
  templateUrl: "./create-responsibility.html",
})
export class CreateResponsibility implements OnInit {
  @Output() created = new EventEmitter<void>();

  responsibilityName = "";
  selectedEmployeeId: string = "";
  employees: any[] = [];
  loading = false;

  constructor(
    private api: Apiservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.api.getAllEmployees(1, 999).subscribe({
      next: (res: any) => {
        this.employees = res.data;
        this.cdr.detectChanges();
      },
    });
  }

  Save(): void {
    this.loading = true;
    this.api
      .addResponsibility(this.selectedEmployeeId, {
        name: this.responsibilityName,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.responsibilityName = "";
          this.selectedEmployeeId = "";
          this.created.emit();
          this.cdr.detectChanges();
          this.api.showSuccess("تم إضافة العهدة بنجاح");
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
          this.api.showError("حدث خطأ أثناء إضافة العهدة");
        },
      });
  }
}
