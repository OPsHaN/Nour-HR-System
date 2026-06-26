import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DatePickerModule } from "primeng/datepicker";
import { Apiservice } from "src/app/services/api.service";

@Component({
  selector: "app-create-missed-hours",
  imports: [CommonModule, FormsModule, DatePickerModule],
  templateUrl: "./create-missed-hours.html",
  styleUrl: "./create-missed-hours.css",
})
export class CreateMissedHours {
  @Output() created = new EventEmitter<void>();

  loading = false;
  form = { reason: "", notes: "", shiftDate: null as any };
  today: Date = new Date();

  yesterday: Date = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  })();

  constructor(private api: Apiservice) {}

  submit() {
    const payload = {
      reason: this.form.reason,
      notes: this.form.notes,
      shiftDate: this.formatDate(this.form.shiftDate),
    };

    this.loading = true;
    this.api.addForgetedHoursRequest(payload).subscribe({
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
