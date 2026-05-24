import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Apiservice } from 'src/app/services/api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [TableModule, TagModule, FormsModule, CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports {
page: number = 1;
pageSize: number = 10;
totalRecords: number = 0;
  loading = false;
  Shifts: any[] = [];
  showReports = false;
fromDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private api: Apiservice,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadAllShifts();
  }

    loadAllShifts() {
    this.loading = true;
    this.api.getAllShifts(this.fromDate).subscribe({
      next: (res: any) => {
        this.Shifts = res.data;
        this.loading = false;
        this.cdr.detectChanges();
        console.log(this.Shifts);
      },
      error: () => {
        this.loading = false;
      },
    });
  }

    confirmDelete(branch: any) {
    this.confirmationService.confirm({
      message: "هل أنت متأكد من حذف الفرع ؟",
      header: "تأكيد الحذف",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "نعم",
      rejectLabel: "لا",

      accept: () => {
        this.deleteReport(branch.id);
      },
    });
  }

  deleteReport(id:string){

  }

  formatTime(time: string): string {
  if (!time) return '-';
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'م' : 'ص';
  const h = hours % 12 || 12;
  return `${h}:${minutes.toString().padStart(2, '0')} ${period}`;
}


}
