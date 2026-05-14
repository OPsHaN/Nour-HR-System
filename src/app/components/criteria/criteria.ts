import { Component } from '@angular/core';
import { CreateCriteria } from '../create-criteria/create-criteria';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { Apiservice } from 'src/app/services/api.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-criteria',
  imports: [TableModule, TagModule, FormsModule, CommonModule, CreateCriteria],
  templateUrl: './criteria.html',
  styleUrl: './criteria.css',
})
export class Criteria {

  page = 1;
  pageSize = 10;
  loading = false;
  Criteria: any[] = [];
  showCreateCriteria = false;

    constructor(
    private api: Apiservice,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit() {
    this.loadCriteria();
  }

  loadCriteria() {
    this.loading = true;
    this.api.getAllCriteria(this.page, this.pageSize).subscribe({
      next: (res: any) => {
        this.Criteria = res.data;
        this.loading = false;
        console.log(res);
      },
      error: () => {
        this.loading = false;
      },
    });
  }

    confirmDelete(criterion: any) {
    this.confirmationService.confirm({
      message: "هل أنت متأكد من حذف البند ؟",
      header: "تأكيد الحذف",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "نعم",
      rejectLabel: "لا",

      accept: () => {
        this.deleteCriteria(criterion.id);
      },
    });
  }

  deleteCriteria(id: string) {
    this.api.deleteCriteria(id, {}).subscribe({
      next: () => { 
        this.api.showSuccess("تم حذف البند بنجاح");
        this.loadCriteria();
      },
      error: () => {
        this.api.showError("حدث خطأ أثناء حذف البند");
      },
    });
  }


  onCriteriaCreated() {
    this.showCreateCriteria = false;
    this.loadCriteria();
  }

}
