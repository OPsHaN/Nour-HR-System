import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { DatePickerModule } from "primeng/datepicker";
import { Apiservice } from "src/app/services/api.service";

@Component({
  selector: "app-create-employee",
  imports: [CommonModule, ReactiveFormsModule , DatePickerModule],
  templateUrl: "./create-employee.html",
  styleUrl: "./create-employee.css",
})
export class CreateEmployee {
  form: FormGroup;
  loading = false;
  successMsg = "";
  errorMsg = "";
  showPassword = false;
  branches: any[] = [];
  banks:any[] = [];
  PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
  @Input() employeeData: any;
  @Output() created = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private api: Apiservice,
  ) {
    this.form = this.fb.group({
      username: ["", Validators.required],
      password: [
        "",
        [
          Validators.required,
          Validators.minLength(6),
        ],
      ],
      name: ["", Validators.required],
      role: ["", Validators.required],
      theNameOfJob: ["", Validators.required],
      bankId: ["", Validators.required],
      bankAccount: ["", Validators.required],
      shiftHours: [8, Validators.required],
      branchId: [0, Validators.required],
      hiringDate: ["", Validators.required],
      qualification: ["", Validators.required],
      graduationYear: [0, Validators.required],
      nationalId: ["", [Validators.required, Validators.minLength(14)]],
      phoneNumber: [
        "",
        [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/), Validators.minLength(11)],
      ],
      totalSalary: [0],
      salaryPerHour: [0],
      EmployeeType: ["", Validators.required],
      Insurence: [0, Validators.required],
      Holidaies: [0, Validators.required],
    });
  }

  ngOnChanges(): void {
    if (this.employeeData) {
      this.form.patchValue(this.employeeData);
      console.log(this.employeeData);
    }
  }

  ngOnInit(): void {
    this.getBranches();
    this.getBanks();
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

    const request = this.employeeData
      ? this.api.editEmployee(this.employeeData.id, this.form.value)
      : this.api.addNewEmployee(this.form.value);

    request.subscribe({
      next: () => {
        this.api.showSuccess(
          this.employeeData ? "تم تعديل الموظف بنجاح" : "تم تسجيل الموظف بنجاح",
        );

        this.form.reset();

        this.loading = false;

        this.created.emit();
      },

      error: (err) => {
        this.api.showError(
          this.employeeData ? "يوجد مشكلة فى التعديل" : "يوجد مشكلة فى التسجيل",
        );

        console.error(err);

        this.loading = false;
      },
    });
  }

  getBranches() {
    this.api.getAllBranches(1, 100).subscribe({
      next: (res: any) => {
        // Handle the list of branches as needed
        this.branches = res.data;
        console.log(this.branches);
      },
      error: (err) => {
        console.error("Error fetching branches:", err);
      },
    });
  }


getBanks() {
    this.api.getAllBanks().subscribe({
      next: (res: any) => { 
        this.banks = res;
      }
      ,error: (err) => {
        console.error("Error fetching banks:", err);
      },
    });
  }
}