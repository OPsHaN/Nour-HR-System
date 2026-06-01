import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ConfirmationService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { Apiservice } from "src/app/services/api.service";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-my-shift",
  imports: [CommonModule, FormsModule, ButtonModule, TableModule],
  templateUrl: "./my-shift.html",
  styleUrl: "./my-shift.css",
})
export class MyShift {
MyShift: any[] = [];
totalRecords = 0;
page = 1;
pageSize = 10;
loading = false;
fromDate: string = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
toDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private api: Apiservice,
    private cdr: ChangeDetectorRef,
  ) {}


onPageChange(event: any) {
  this.page = event.first / event.rows + 1;
  this.pageSize = event.rows;
  if (this.fromDate && this.toDate) {
    this.loadMyShifts();
  }
}

loadMyShifts() {
  this.loading = true;
  this.api.getMyShifts(this.fromDate, this.toDate).subscribe({
    next: (res: any) => {
      this.MyShift = res.data;
      this.totalRecords = res.totalCount;
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

formatTime(time: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'م' : 'ص';
  const h = hours % 12 || 12;
  return `${h}:${minutes.toString().padStart(2, '0')} ${period}`;
}


}
