import { CommonModule } from "@angular/common";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SelectModule } from "primeng/select";
import { Apiservice } from "src/app/services/api.service"

@Component({
  selector: 'app-create-appointment',
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './create-appointment.html',
  styleUrl: './create-appointment.css',
})
export class CreateAppointment implements OnInit {

  @Output() created = new EventEmitter<void>();

  loading = false;
  employees: any[] = [];
  form = { employeeId: null as any };

  constructor(private api: Apiservice) {}

  ngOnInit() {
    this.api.getAllEmployees(1,250).subscribe({
      next: (res: any) => (this.employees = res.data ?? res),
      error: (err) => console.error(err),
    });
  }

  submit() {
    this.loading = true;
    this.api.addAppointment({ employeeId: this.form.employeeId }).subscribe({
      next: () => {
        this.api.showSuccess("تم إرسال الطلب بنجاح");
        this.loading = false;
        this.created.emit();
      },
      error: (err) => {
        this.api.showError("حدث خطأ أثناء الإرسال");
        this.loading = false;
        console.error(err);
      },
    });
  }
}



