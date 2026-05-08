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
  selector: "app-create-employee",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./create-employee.html",
  styleUrl: "./create-employee.css",
})
export class CreateEmployee {
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
      username: ["", Validators.required],
      password: [
        "",
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(this.PASSWORD_PATTERN),
      ],
      name: ["", Validators.required],
      role: ["", Validators.required],
      theNameOfJob: ["", Validators.required],
      bankName: ["", Validators.required],
      bankAccount: ["", Validators.required],
      shiftHours: [8, Validators.required],
      branchId: [null, Validators.required],
      hiringDate: ["", Validators.required],
      qualification: ["", Validators.required],
      graduationYear: [null, Validators.required],
      nationalId: ["", [Validators.required, Validators.minLength(14)]],
      phoneNumber: ["", Validators.required],
      totalSalary: [null, Validators.required],
      salaryPerHour: [null],
    });
  }

  ngOnInit(): void {
    // Component initialization logic if needed
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
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

    this.api.addNewEmployee(this.form.value).subscribe({
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
