import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Apiservice } from "src/app/services/api.service";
import { DatePickerModule } from "primeng/datepicker";

@Component({
  selector: "app-create-overtime",
  imports: [CommonModule, FormsModule, DatePickerModule],
  templateUrl: "./create-overtime.html",
  styleUrl: "./create-overtime.css",
})
export class CreateOvertime {
  @Output() created = new EventEmitter<void>();

  loading = false;
  form = { hours: null as any, notes: "" , dateOfShift:null as any };
  today: Date = new Date();
  yesterday: Date = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  })();
  
  constructor(private api: Apiservice) {}

  submit() {
    const payload = {
      hours: this.form.hours,
      notes: this.form.notes,
      dateOfShift: this.form.dateOfShift,
    };

    this.loading = true;
    this.api.addOvertime(payload).subscribe({
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
