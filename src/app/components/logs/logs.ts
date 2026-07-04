import { ChangeDetectorRef, Component } from "@angular/core";
import { Apiservice } from "src/app/services/api.service";
import { TableModule } from "primeng/table";

@Component({
  selector: "app-logs",
  imports: [TableModule],
  templateUrl: "./logs.html",
  styleUrl: "./logs.css",
})
export class Logs {
    allLogs: any[] = []; 
  logs: any[] = [];
  totalRecords = 0;
  page = 1;
  pageSize = 15;
  loading = false;

  constructor(
    private api: Apiservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadLogs();
  }

loadLogs(page: number = 1, pageSize: number = this.pageSize) {
  this.loading = true;
  this.api.getAllLogs(page, pageSize).subscribe({ // pass params to backend
    next: (res: any) => {
      this.logs = res.data.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      this.totalRecords = res.totalCount;
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.loading = false;
    },
  });
}

onPageChange(event: any) {
  this.page = event.first / event.rows + 1;
  this.pageSize = event.rows;
  this.loadLogs(this.page, this.pageSize);
}

  updatePage() {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.logs = this.allLogs.slice(start, end);
  }


    formatArabicDate(date: string | Date): string {
    const d = new Date(date);

    const dateStr = d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: "short",
      day: '2-digit',
    });

    const timeStr = d.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return `${dateStr} - ${timeStr}`;
  }

}
