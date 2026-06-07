import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Apiservice } from "src/app/services/api.service";

@Component({
  selector: 'app-create-resignation',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-resignation.html',
  styleUrl: './create-resignation.css',
})
export class CreateResignation {

  @Output() created = new EventEmitter<void>();

  loading = false;
  form = { reason: "" };

  constructor(private api: Apiservice) {}

  submit() {
    this.loading = true;
    this.api.addResignation({ reason: this.form.reason }).subscribe({
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

