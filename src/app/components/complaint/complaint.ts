import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { DialogModule } from "primeng/dialog";
import { CreateComplaint } from "../create-complaint/create-complaint";
import { RespondComplaint } from "../respond-complaint/respond-complaint";
import { Apiservice } from "src/app/services/api.service";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-complaint",
  imports: [
    TableModule,
    TagModule,
    FormsModule,
    CommonModule,
    DialogModule,
    CreateComplaint,
    RespondComplaint,
  ],
  templateUrl: "./complaint.html",
  styleUrl: "./complaint.css",
})
export class Complaint implements OnInit {
  page = 1;
  pageSize = 10;
  loading = false;
  complaints: any[] = [];
  totalRecords = 0;
  showCreateComplaint = false;
  showRespondDialog = false;
  showViewDialog = false;
  selectedComplaint: any = null;

  constructor(
    private api: Apiservice,
    private cdr: ChangeDetectorRef,
    public auth: AuthService,
  ) {}

  ngOnInit() {
    if (this.auth.isAdmin || this.auth.isHR || this.auth.isAreaManager || this.auth.isManager || this.auth.isControl || this.auth.isAccountant) {
      this.loadComplaints();
    }
    else {
      this.loadComplaintsForUser();
    }
  }

    get isEmployee(): boolean {
    return localStorage.getItem("role") === "Employee";
  }

  loadComplaints() {
    this.loading = true;
    this.api.getAllComplaints(this.page, this.pageSize).subscribe({
      next: (res: any) => {
        this.complaints = res.data || [];
        this.totalRecords = res.totalCount ?? this.complaints.length;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadComplaintsForUser() {
    this.loading = true;
    const employeeId = localStorage.getItem("employeeId") || "";
    this.api.getAllComplaintsForUser(employeeId, this.page, this.pageSize).subscribe({
      next: (res: any) => {
        this.complaints = res.data || [];
        this.totalRecords = res.totalCount ?? this.complaints.length;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      Pending: "قيد الانتظار",
      Resolved: "تم الحل",
      Rejected: "مرفوضة",
    };
    return map[status] ?? status;
  }

  openRespondDialog(complaint: any) {
    this.selectedComplaint = complaint;
    this.showRespondDialog = true;
    this.api.markComplaintAsSeen(complaint.id).subscribe({  
      next: () => {
        if (this.auth.isAdmin || this.auth.isHR || this.auth.isAreaManager || this.auth.isManager || this.auth.isControl || this.auth.isAccountant) {
          this.loadComplaints();
        }
        else {
          this.loadComplaintsForUser();
        }
      },
      error: (err) => {
        console.error("Error marking complaint as seen:", err);
      },
    });
  }

  viewResponse(complaint: any) {
    this.selectedComplaint = complaint;
    this.showViewDialog = true;
  }

  onResponded() {
    this.showRespondDialog = false;
        if (this.auth.isAdmin || this.auth.isHR || this.auth.isAreaManager || this.auth.isManager || this.auth.isControl || this.auth.isAccountant) {
      this.loadComplaints();
    }
    else {
      this.loadComplaintsForUser();
    }
  }

  onComplaintCreated() {
    this.showCreateComplaint = false;
        if (this.auth.isAdmin || this.auth.isHR || this.auth.isAreaManager || this.auth.isManager || this.auth.isControl || this.auth.isAccountant) {
      this.loadComplaints();
    }
    else {
      this.loadComplaintsForUser();
    }
  }

  onPageChange(event: any): void {
    this.page = event.first / event.rows + 1;
    this.pageSize = event.rows;
        if (this.auth.isAdmin || this.auth.isHR || this.auth.isAreaManager || this.auth.isManager || this.auth.isControl || this.auth.isAccountant) {
      this.loadComplaints();
    }
    else {
      this.loadComplaintsForUser();
    }
  }
}
