import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apiservice } from 'src/app/services/api.service';

@Component({
  selector: 'app-create-bank',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-bank.html',
  styleUrl: './create-bank.css',
})
export class CreateBank {
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

    this.api.addNewBank(this.form.value).subscribe({
      next: () => {
        this.api.showSuccess("تم إضافة البنك بنجاح");
        this.form.reset();
        this.loading = false;
        this.created.emit();
      },
      error: (err) => {
        this.api.showError("حدث خطأ في إضافة البنك");
        console.error(err);
        this.loading = false;
      },
    });
  }
}
