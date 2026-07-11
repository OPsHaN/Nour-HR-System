import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { CreateBranch } from "../create-branch/create-branch";
import { ConfirmationService } from "primeng/api";
import { Apiservice } from "src/app/services/api.service";

@Component({
  selector: "app-branches",
  imports: [TableModule, TagModule, FormsModule, CommonModule, CreateBranch],
  templateUrl: "./branches.html",
  styleUrl: "./branches.css",
})
export class Branches {
  page = 1;
  pageSize = 10;
  loading = false;
  Branches: any[] = [];
  showCreateBranch = false;
  showEditBranch = false;
  selectedBranch: any = null;
  totalRecords = 0;

  constructor(
    private api: Apiservice,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadBranches();
  }

  loadBranches() {
    this.loading = true;
    this.api.getAllBranches(this.page, this.pageSize).subscribe({
      next: (res: any) => {
        this.Branches = res.data;
        this.loading = false;
        this.totalRecords = res.totalCount;
        this.cdr.detectChanges();
        console.log(res);
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
        this.deleteBranch(branch.id);
      },
    });
  }

  deleteBranch(id: string) {
    this.api.deleteBranch(id, { isActive: false }).subscribe({
      next: () => {
        this.api.showSuccess("تم حذف الفرع بنجاح");
        this.loadBranches();
      },
      error: (err) => {
        this.api.showError("حدث خطأ أثناء الحذف");
        console.error(err);
      },
    });
  }

  onPageChange(event: any): void {
    this.page = event.first / event.rows + 1;
    this.pageSize = event.rows;
    this.loadBranches();
  }

  editBranch(branch: any) {
    this.selectedBranch = branch;
    this.showCreateBranch = false;
    this.showEditBranch = true;
  }

  onBranchCreated() {
    this.showCreateBranch = false;
    this.loadBranches();
  }

  onBranchUpdated() {
    this.showEditBranch = false;
    this.selectedBranch = null;
    this.loadBranches();
  }
}
