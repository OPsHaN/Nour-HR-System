import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SelectModule } from "primeng/select";
import { Apiservice } from "src/app/services/api.service";

@Component({
  selector: "app-create-complaint",
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: "./create-complaint.html",
})
export class CreateComplaint {
  @Output() created = new EventEmitter<void>();

  loading = false;

  form = {
    Content: "",
    RecipientRole: "",
  };

  recipientRoles = [
    { label: "مدير المنطقة", value: "AreaManager" },
    { label: "الموارد البشرية", value: "HR" },
    { label: "الإدارة", value: "Admin" },
  ];

  constructor(private api: Apiservice) {}

  submit() {
    if (!this.form.Content.trim() || !this.form.RecipientRole) {
      this.api.showError("يرجى ملء جميع الحقول");
      return;
    }

    this.loading = true;
    this.api.addComplaint(this.form).subscribe({
      next: () => {
        this.api.showSuccess("تم إرسال الشكوى بنجاح");
        this.loading = false;
        this.created.emit();
      },
      error: (err) => {
        this.api.showError("حدث خطأ أثناء إرسال الشكوى");
        this.loading = false;
        console.error(err);
      },
    });
  }
}