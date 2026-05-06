import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Apiservice } from "src/app/services/api.service";

@Component({
  selector: "app-create-user",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./create-user.html",
  styleUrl: "./create-user.css",
})
export class CreateUser {
  form: FormGroup;
  loading = false;
  successMsg = "";
  errorMsg = "";
  showPassword = false;
  PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

  constructor(
    private fb: FormBuilder,
    private api: Apiservice,
  ) {
    this.form = this.fb.group({
      Username: ["", Validators.required],
      Password: [
        "",
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(this.PASSWORD_PATTERN),
        ],
      ],
      Role: ["", Validators.required],
      Name: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    // Component initialization logic if needed
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  get passwordValue(): string {
  return this.form.get('Password')?.value || '';
}

hasUpperCase(): boolean {
  return /[A-Z]/.test(this.passwordValue);
}

hasLowerCase(): boolean {
  return /[a-z]/.test(this.passwordValue);
}

hasNumber(): boolean {
  return /\d/.test(this.passwordValue);
}

hasSymbol(): boolean {
  return /[\W_]/.test(this.passwordValue);
}

  isRequired(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control?.hasValidator(Validators.required) ?? false;
  }

  Submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMsg = "";
    this.errorMsg = "";

    this.api.createUser(this.form.value).subscribe({
      next: () => {
        this.api.showSuccess("تم تسجيل الموظف بنجاح");
        this.form.reset();
        this.loading = false;
      },
      error: (err) => {
        this.api.showError("يوجد مشكلة فى التسجيل");
        console.error(err);
        this.loading = false;
      },
    });
  }
}
