import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ConfirmationService } from "primeng/api";
import { TableModule } from "primeng/table";
import {
  Apiservice,
  BiometricDevice,
} from "src/app/services/api.service";

@Component({
  selector: "app-biometric-devices",
  imports: [CommonModule, ReactiveFormsModule, TableModule],
  templateUrl: "./biometric-devices.html",
  styleUrl: "./biometric-devices.css",
})
export class BiometricDevices implements OnInit {
  page = 1;
  pageSize = 10;
  totalRecords = 0;
  devices: BiometricDevice[] = [];
  loading = false;
  saving = false;
  deletingDeviceId: number | null = null;
  showAddForm = false;
  readonly form: FormGroup<{ apiKey: FormControl<string> }>;

  constructor(
    private readonly api: Apiservice,
    private readonly confirmationService: ConfirmationService,
    private readonly formBuilder: FormBuilder,
  ) {
    this.form = this.formBuilder.nonNullable.group({
      apiKey: ["", [Validators.required ]],
    });
  }

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    this.loading = true;
    this.api.getAllBiometricDevices().subscribe({
      next: (devices) => {
        this.devices = devices;
        this.totalRecords = devices.length;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.api.showError("حدث خطأ أثناء تحميل أجهزة البصمة");
        console.error(error);
      },
    });
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.page = event.first / event.rows + 1;
    this.pageSize = event.rows;
    this.loadDevices();
  }

  addDevice(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    const apiKey = this.form.controls.apiKey.value.trim();
    if (!apiKey) {
      this.form.controls.apiKey.setValue("");
      this.form.controls.apiKey.markAsTouched();
      return;
    }

    this.saving = true;
    this.api.addBiometricDevice(apiKey).subscribe({
      next: () => {
        this.saving = false;
        this.form.reset();
        this.showAddForm = false;
        this.api.showSuccess("تم إضافة جهاز البصمة بنجاح");
        this.loadDevices();
      },
      error: (error) => {
        this.saving = false;
        this.api.showError("حدث خطأ أثناء إضافة جهاز البصمة");
        console.error(error);
      },
    });
  }

  confirmDelete(device: BiometricDevice): void {
    this.confirmationService.confirm({
      message: "هل أنت متأكد من حذف مفتاح جهاز البصمة؟",
      header: "تأكيد الحذف",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "نعم",
      rejectLabel: "إلغاء",
      accept: () => this.deleteDevice(device.id),
    });
  }

  private deleteDevice(deviceId: number): void {
    this.deletingDeviceId = deviceId;
    this.api.deleteBiometricDevice(deviceId).subscribe({
      next: () => {
        this.deletingDeviceId = null;
        this.api.showSuccess("تم حذف جهاز البصمة بنجاح");
        this.loadDevices();
      },
      error: (error) => {
        this.deletingDeviceId = null;
        this.api.showError("حدث خطأ أثناء حذف جهاز البصمة");
        console.error(error);
      },
    });
  }
}
