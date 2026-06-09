import { ChangeDetectorRef, Component } from "@angular/core";
import { Apiservice } from "src/app/services/api.service";
import { TableModule } from "primeng/table";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-logs",
  imports: [TableModule, DatePipe],
  templateUrl: "./logs.html",
  styleUrl: "./logs.css",
})
export class Logs {
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
        this.logs = res.data.reverse();
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
    this.loadLogs();
  }
}
