import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MessageService } from "primeng/api";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { finalize } from "rxjs";

@Component({
  selector: "app-login",
  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./login.html",
  styleUrl: "./login.css",
})
export class Login {
  showPassword = false;
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = "";
  activePage: string = "desktop";
  roleProfile: string = "غير معروف";
  userImg: string = "assets/images/user.png";

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private authService: AuthService,
    private messageService: MessageService,
  ) {
    this.loginForm = this.fb.group({
      username: ["", [Validators.required]],
      password: ["", Validators.required],
    });
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = "";

    this.authService
      .login(this.loginForm.value)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          console.log(res.token);

          // حفظ البيانات في localStorage
          localStorage.setItem("name", res.name);
          // localStorage.setItem("fullName", res.FullName || "");
          // localStorage.setItem("img", res.Img || "");
          localStorage.setItem("role", res.role);

          this.authService.onLoginSuccess(res.token);

          this.showSuccess("تم تسجيل الدخول بنجاح");
          this.router.navigate(["/desktop"]);
          this.activePage = "desktop";
        },
        error: (err) => {
          if (err.status === 401) {
            this.showError("هذا الموظف غير موجود");
          } else if (err.status === 500) {
            this.showError("لا يمكن الاتصال بالخادم. تحقق من الاتصال.");
          } else {
            this.showError("اسم المستخدم أو كلمة المرور غير صحيحة");
          }
        },
      });
  }

  showError(msg: string) {
    this.messageService.add({
      severity: "error",
      // summary: "خطأ",
      detail: msg,
      life: 2000,
    });
  }

  showSuccess(msg: string) {
    this.messageService.add({
      severity: "success",
      // summary: "تم بنجاح",
      detail: msg,
      life: 3000,
    });
  }
}
