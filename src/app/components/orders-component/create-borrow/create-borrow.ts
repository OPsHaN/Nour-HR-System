import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DatePickerModule } from "primeng/datepicker";
import { Apiservice } from "src/app/services/api.service";


@Component({
  selector: 'app-create-borrow',
  imports: [CommonModule, FormsModule, DatePickerModule],
  templateUrl: './create-borrow.html',
  styleUrl: './create-borrow.css',
})
export class CreateBorrow {

  @Output() created = new EventEmitter<void>();

  loading = false;
  form = { amount: null as any, notes: "" };

  constructor(private api: Apiservice) {}

  submit() {
    this.loading = true;
    this.api.addBorrow({ amount: this.form.amount, notes: this.form.notes }).subscribe({
      next: () => {
        this.api.showSuccess("تم إرسال الطلب بنجاح");
        this.loading = false;
        this.created.emit();
      },
      error: (err) => {
        this.api.showError("حدث خطأ أثناء الإرسال");
        this.loading = false;
        console.error(err);
      },
    });
  }
}