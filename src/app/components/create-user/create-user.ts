import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, EventEmitter, Output } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Apiservice } from "src/app/services/api.service";
import { MultiSelect } from 'primeng/multiselect';

@Component({
  selector: "app-create-user",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule , MultiSelect],
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
  Branches: any[] = [];
  page = 1;
  pageSize = 999;
  totalRecords = 0;

  @Output() created = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private api: Apiservice,
        private cdr: ChangeDetectorRef,

  ) {
    this.form = this.fb.group({
      Username: ["", Validators.required],
      Password: [
        "",
        [
          Validators.required,
          Validators.minLength(4),
        ],
      ],
      Role: ["", Validators.required],
      Name: ["", Validators.required],
            BranchIds: [[]],

    });
  }

   ngOnInit(): void {
    this.loadBranches();

    this.form.get("Role")?.valueChanges.subscribe((role) => {
      const branchControl = this.form.get("BranchIds");

      if (role === "AreaManager") {
        branchControl?.setValidators([Validators.required]);
      } else {
        branchControl?.clearValidators();
        branchControl?.setValue([]);
      }

      branchControl?.updateValueAndValidity();
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  get passwordValue(): string {
    return this.form.get("Password")?.value || "";
  }

    loadBranches() {
    this.loading = true;
    this.api.getAllBranches(this.page, this.pageSize).subscribe({
      next: (res: any) => {
        this.Branches = res.data;
        this.loading = false;
        this.totalRecords = res.totalCount;
        this.cdr.detectChanges();
        console.log(res);
      },
      error: () => {
        this.loading = false;
      },
    });
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

    const payload = {
      Username: this.form.value.Username,
      Password: this.form.value.Password,
      Role: this.form.value.Role,
      Name: this.form.value.Name,
      BranchIds:
        this.form.value.Role === "AreaManager"
          ? this.form.value.BranchIds || []
          : [],
    };

    this.loading = true;
    this.successMsg = "";
    this.errorMsg = "";

    this.api.createUser(payload).subscribe({
      next: () => {
        this.api.showSuccess("تم تسجيل المستخدم بنجاح");

        this.form.reset({
          Username: "",
          Password: "",
          Role: "",
          Name: "",
          BranchIds: [],
        });

        this.loading = false;
        this.created.emit();
      },
      error: (err) => {
        this.api.showError("يوجد مشكلة فى التسجيل");
        console.error(err);
        this.loading = false;
      },
    });
  }
}
