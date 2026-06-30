import { Component } from "@angular/core";
import { ChangeDetectorRef } from "@angular/core";
import { Apiservice } from "src/app/services/api.service";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { ConfirmationService } from "primeng/api";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CreateUser } from "../create-user/create-user";
import { DialogModule } from "primeng/dialog";
import { forkJoin, of } from "rxjs";
import { MultiSelect } from "primeng/multiselect";
import { ChipModule } from "primeng/chip";

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  isActive: boolean;
}

@Component({
  selector: "app-users",
  imports: [
    TableModule,
    TagModule,
    FormsModule,
    CommonModule,
    CreateUser,
    DialogModule,
    MultiSelect,
    ChipModule
  ],
  templateUrl: "./users.html",
  styleUrl: "./users.css",
})
export class Users {
  users: User[] = [];
  totalRecords = 0;
  page = 1;
  pageSize = 10;
  showCreateUser: boolean = false;
  showPassword = false;
  editingRowKeys: { [key: string]: boolean } = {};
  branchesDialogVisible = false;
  loadingBranches = false;
  selectedManager: User | null = null;
  managerBranches: any[] = [];
  allBranches: any[] = [];
  availableBranches: any[] = [];
  selectedBranchToAdd: number | null = null;
  selectedBranchIds: number[] = [];
  originalBranchIds: number[] = [];
  savingBranches = false;
  searchTerm: string = "";

  constructor(
    private api: Apiservice,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
  ) {}



  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  getEmployees() {
    this.api.getAllUsers(this.page, this.pageSize).subscribe({
      next: (res: any) => {
        this.users = res.data || [];
        this.totalRecords = res.totalCount ?? this.users.length;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  onRowEditSave(emp: any) {
    // update user data
    this.api.changePassword(emp.id, emp.password).subscribe({
      next: () => {
        this.api.showSuccess("تم تغيير كلمة المرور");
        emp.password = "";
        delete this.editingRowKeys[emp.id];
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.api.showError("فشل تغيير كلمة المرور");
        console.error(err);
      },
    });
  }

  confirmDelete(emp: any) {
    this.confirmationService.confirm({
      message: "هل أنت متأكد من حذف المستخدم؟",
      header: "تأكيد الحذف",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "نعم",
      rejectLabel: "إلغاء",

      accept: () => {
        this.deleteEmployee(emp.id);
      },
    });
  }

  deleteEmployee(id: string) {
    console.log("Deleted ID:", id);
    // this.api.deleteEmpyee(id).subscribe({
    //         next: () => {
    //     this.api.showSuccess("تم حذف الموظف ");
    //     this.cdr.detectChanges();
    //   },
    //   error: (err) => {
    //     this.api.showError("حدث خطأ أثناء الحذف");
    //     console.error(err);
    //   },
    // })
  }

  onEmployeeCreated() {
    this.showCreateUser = false;
    this.getEmployees();
  }

  onStatusChange(emp: any) {
    this.api.changeStatus(emp.id, emp.isActive).subscribe({
      next: () => {
        this.api.showSuccess("تم تغيير الحالة بنجاح");
        this.cdr.detectChanges();
        delete this.editingRowKeys[emp.id];
      },
      error: (err) => {
        this.api.showError("حدث خطأ أثناء تغيير الحالة");

        // rollback لو حصل error
        emp.isActive = !emp.isActive;

        console.error(err);
      },
    });
  }

  onPageChange(event: any) {
    this.page = event.first / event.rows + 1;
    this.pageSize = event.rows;
    this.getEmployees();
  }

  loadAllBranches() {
    this.api.getAllBranches(1, 100).subscribe({
      next: (res: any) => {
        this.allBranches = res.data || [];
        console.log(this.allBranches)
      },
      error: (err) => console.error(err),
    });
  }

  openBranchesDialog(emp: User) {
    this.selectedManager = emp;
    console.log(emp.id)
       this.selectedBranchToAdd = null;
    this.branchesDialogVisible = true;
    this.loadAllBranches();
    this.loadManagerBranches(emp.id);
  }

  loadManagerBranches(uuid: string) {
    this.loadingBranches = true;
    this.api.getBranchesForAreaManagers(uuid).subscribe({
      next: (res: any) => {
        const branchIds: number[] = res ?? [];
        this.selectedBranchIds = [...branchIds];
        this.originalBranchIds = [...branchIds];
        this.loadingBranches = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.selectedBranchIds = [];
        this.originalBranchIds = [];
        this.loadingBranches = false;
        this.cdr.detectChanges();
      },
    });
  }

  getBranchName(branchId: number): string {
    return this.allBranches.find((b) => b.id === branchId)?.name ?? "";
  }

  removeBranchChip(branchId: number) {
    this.selectedBranchIds = this.selectedBranchIds.filter(
      (id) => id !== branchId,
    );
  }

  updateAvailableBranches() {
    const addedIds = this.managerBranches.map((b) => b.id);
    this.availableBranches = this.allBranches.filter(
      (b) => !addedIds.includes(b.id),
    );
  }

  saveBranches() {
    if (!this.selectedManager) return;

    const managerId = this.selectedManager.id;

    // الفروع الجديدة المضافة (موجودة في selected وملهاش في original)
    const toAdd = this.selectedBranchIds.filter(
      (id) => !this.originalBranchIds.includes(id),
    );

    // الفروع المحذوفة (موجودة في original ومش موجودة في selected)
    const toRemove = this.originalBranchIds.filter(
      (id) => !this.selectedBranchIds.includes(id),
    );

    if (toAdd.length === 0 && toRemove.length === 0) {
      this.branchesDialogVisible = false;
      return;
    }

    this.savingBranches = true;

    const addRequests = toAdd.map((branchId) =>
      this.api.addBranchesToAreaManagers(managerId, branchId),
    );
    const removeRequests = toRemove.map((branchId) =>
      this.api.deleteBracnhesAreaManagers(managerId, branchId),
    );

    const allRequests = [...addRequests, ...removeRequests];

    forkJoin(allRequests.length ? allRequests : [of(null)]).subscribe({
      next: () => {
        this.api.showSuccess("تم تحديث الفروع بنجاح");
        this.savingBranches = false;
        this.branchesDialogVisible = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.api.showError("حدث خطأ أثناء تحديث الفروع");
        console.error(err);
        this.savingBranches = false;
        this.cdr.detectChanges();
      },
    });
  }

    onSearchTermChange() {
    this.page = 1;

    if (!this.searchTerm.trim()) {
    this.getEmployees();
      return;
    }

    this.api
      .getAllUsersByName(this.page, this.pageSize, this.searchTerm)
      .subscribe({
        next: (res: any) => {
          this.users = res.data ?? res;
          this.totalRecords = res.totalCount ?? this.users.length;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  clearSearch() {
    this.searchTerm = "";
    this.getEmployees();
  }

}
