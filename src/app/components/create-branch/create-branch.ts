import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Apiservice } from "src/app/services/api.service";

@Component({
  selector: "app-create-branch",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./create-branch.html",
  styleUrl: "./create-branch.css",
})
export class CreateBranch implements OnChanges {
  form!: FormGroup;
  loading = false;
  successMsg = "";
  errorMsg = "";
  showPassword = false;
  @Input() branchToEdit: any | null = null;
  @Input() mode: "create" | "edit" = "create";
  @Output() created = new EventEmitter<void>();
  @Output() edited = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private api: Apiservice,
  ) {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["branchToEdit"] && this.branchToEdit) {
      this.patchBranchData(this.branchToEdit);
    }
  }

  private initForm() {
    this.form = this.fb.group({
      Name: ["", Validators.required],
      TargetNumberOfEmployees: [""],
      TargetSalaries: [""],
      TargetHours: [""],
    });

    if (this.branchToEdit) {
      this.patchBranchData(this.branchToEdit);
    }
  }

  private patchBranchData(branch: any) {
    this.form.patchValue({
      Name: branch?.name ?? branch?.Name ?? "",
      TargetNumberOfEmployees:
        branch?.targetNumberOfEmployees ?? branch?.TargetNumberOfEmployees ?? "",
      TargetSalaries: branch?.targetSalaries ?? branch?.TargetSalaries ?? "",
      TargetHours: branch?.targetHours ?? branch?.TargetHours ?? "",
    });
  }

  Submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const payload = this.mode === "edit" && this.branchToEdit?.id
      ? {
          Name: this.form.value.Name?.trim().toString(),
          TargetNumberOfEmployees: this.form.value.TargetNumberOfEmployees?.toString(),
          TargetSalaries: this.form.value.TargetSalaries?.toString(),
          TargetHours: this.form.value.TargetHours?.toString(),
        }
      : {
          ...this.form.value,
          Name: this.form.value.Name?.trim(),
        };

    const request =
      this.mode === "edit" && this.branchToEdit?.id
        ? this.api.updateBranch(this.branchToEdit.id, payload)
        : this.api.addNewBranch(payload);

    request.subscribe({
      next: () => {
        this.api.showSuccess(
          this.mode === "edit" ? "تم تعديل الفرع بنجاح" : "تم إضافة الفرع بنجاح",
        );

        if (this.mode === "edit") {
          this.edited.emit();
        } else {
          this.form.reset({
            Name: "",
            TargetNumberOfEmployees: "",
            TargetSalaries: "",
            TargetHours: "",
          });
          this.created.emit();
        }

        this.loading = false;
      },
      error: (err) => {
        this.api.showError("حدث خطأ");
        console.error(err);
        this.loading = false;
      },
    });
  }
}
