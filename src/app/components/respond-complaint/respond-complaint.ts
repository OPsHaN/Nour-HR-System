import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DialogModule } from "primeng/dialog";
import { Apiservice } from "src/app/services/api.service";

@Component({
  selector: "app-respond-complaint",
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: "./respond-complaint.html",
  styleUrl: "./respond-complaint.css",
})
export class RespondComplaint implements OnChanges {

    @Input() complaint: any = null;
  @Output() responded = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  visible = true;
  loading = false;

  form = {
    response: "",
    status: "Resolved",
  };


  constructor(private api: Apiservice) {}

  ngOnChanges() {
    // reset الفورم كل ما اتفتح على شكوى جديدة
    this.form = { response: "", status: "Resolved" };
  }

  submit() {
    if (!this.form.response.trim()) {
      this.api.showError("يرجى كتابة الرد أولاً");
      return;
    }

    this.loading = true;

    const payload = {
      Response: this.form.response.trim(),
      Status: this.form.status,
    };

    this.api.respondToComplaint(this.complaint.id, payload).subscribe({
      next: () => {
        this.api.showSuccess("تم إرسال الرد بنجاح");
        this.loading = false;
        this.responded.emit();
      },
      error: (err) => {
        this.api.showError("حدث خطأ أثناء إرسال الرد");
        this.loading = false;
        console.error(err);
      },
    });
  }
}

