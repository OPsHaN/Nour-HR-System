import { Component } from "@angular/core";
import { ChangeDetectorRef } from "@angular/core";
import { CreateBank } from "../create-bank/create-bank";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TagModule } from "primeng/tag";
import { TableModule } from "primeng/table";
import { Apiservice } from "src/app/services/api.service";
import { ConfirmationService } from "primeng/api";

@Component({
  selector: "app-banks",
  imports: [TableModule, TagModule, FormsModule, CommonModule, CreateBank],
  templateUrl: "./banks.html",
  styleUrl: "./banks.css",
})
export class Banks {
  page = 1;
  pageSize = 10;
  loading = false;
  Banks: any[] = [];
  showCreateBank = false;

  constructor(
    private api: Apiservice,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadBanks();
  }

  loadBanks() {
    this.loading = true;
    this.api.getAllBanks().subscribe({
      next: (res: any) => {
        this.Banks = res;
        this.loading = false;
        this.cdr.detectChanges();
        console.log(res);
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  confirmDelete(bank: any) {
    this.confirmationService.confirm({
      message: "هل أنت متأكد من حذف البنك ؟",
      header: "تأكيد الحذف",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "نعم",
      rejectLabel: "لا",

      accept: () => {
        this.deleteBank(bank.id);
      },
    });
  }

  deleteBank(id: string) {
    this.api.deleteBank(id).subscribe({
      next: () => {
        this.api.showSuccess("تم حذف البنك بنجاح");
        this.loadBanks();
      },
      error: (err) => {
        this.api.showError("حدث خطأ أثناء الحذف");
        console.error(err);
      },
    });
  }

  onBankCreated() {
    this.showCreateBank = false;
    this.loadBanks();
  }
}
