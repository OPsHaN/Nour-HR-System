import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Apiservice } from "src/app/services/api.service";

@Component({
  selector: "app-create-criteria",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./create-criteria.html",
  styleUrl: "./create-criteria.css",
})
export class CreateCriteria {
  form: FormGroup;
  loading = false;
  successMsg = "";
  errorMsg = "";
  showPassword = false;
  @Output() created = new EventEmitter<void>();
  constructor(
    private fb: FormBuilder,
    private api: Apiservice,
  ) {
    this.form = this.fb.group({
      Name: ["", Validators.required],
    });
  }

    Submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.api.addNewCriteria(this.form.value).subscribe({
      next: () => {
        this.api.showSuccess("تم إضافة البند بنجاح");
        this.form.reset();
        this.loading = false;
        this.created.emit();
      },
      error: (err) => {
        this.api.showError("حدث خطأ");
        console.error(err);
        this.loading = false;
      },
    });
  }
}
