import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Apiservice } from "src/app/services/api.service";


@Component({
  selector: 'app-create-overtime',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-overtime.html',
  styleUrl: './create-overtime.css',
})
export class CreateOvertime {

  @Output() created = new EventEmitter<void>();

  loading = false;
  form = { hours: null as any, notes: "" };

  constructor(private api: Apiservice) {}

  submit() {
    const payload = {
      hours: this.form.hours,
      notes: this.form.notes,
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

