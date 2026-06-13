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
  pageSize = 10;
  loading = false;

  constructor(
    private api: Apiservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.loading = true;
    this.api.getAllLogs().subscribe({
      next: (res: any) => {
      console.log('Raw response:', res); // 👈 شوف الشكل الحقيقي في Console
        this.allLogs = [...res.data ].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        this.totalRecords = this.allLogs.length;
        this.updatePage();

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  updatePage() {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.logs = this.allLogs.slice(start, end);
  }

  onPageChange(event: any) {
    this.page = event.first / event.rows + 1;
    this.pageSize = event.rows;
    this.updatePage();
    this.cdr.detectChanges();
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
