import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DatePickerModule } from "primeng/datepicker";
import { Apiservice } from "src/app/services/api.service";


@Component({
  selector: 'app-create-holiday',
  imports: [CommonModule, FormsModule, DatePickerModule],
  templateUrl: './create-holiday.html',
  styleUrl: './create-holiday.css',
})
export class CreateHoliday {

    @Output() created = new EventEmitter<void>();

  loading = false;
  form = { fromDate: null as any, toDate: null as any };
  today: Date = new Date();
  
  constructor(private api: Apiservice) {}

  submit() {
    const payload = {
      fromDate: this.formatDate(this.form.fromDate),
      toDate: this.formatDate(this.form.toDate),
    };

    this.loading = true;
    this.api.addHoliday(payload).subscribe({
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

  formatDate(date: Date | null): string {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
}



