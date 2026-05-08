import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
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

  constructor(
    private api: Apiservice,
    private confirmationService: ConfirmationService,
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
        console.log(res);
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  editBranch(branch: any) {
    console.log("Updated:", branch);
  }

  confirmDelete(branch: any) {
    this.confirmationService.confirm({
      message: "هل أنت متأكد من حذف الفرع",
      header: "تأكيد الحذف",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "نعم",
      rejectLabel: "لا",
    });
  }

  deleteBranch(id: string) {
    this.api.editBranch(id, { isActive: false }).subscribe({
      next: () => {
        this.loadBranches();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
