import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MessageService } from "primeng/api";
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

  constructor(
    private fb: FormBuilder,
    private api: Apiservice,
  ) {
    this.form = this.fb.group({
      Username: ["", Validators.required],
      Password: ["", [Validators.required, Validators.minLength(6)]],
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
