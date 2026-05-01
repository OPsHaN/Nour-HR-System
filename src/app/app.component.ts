import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from "@angular/core";

import { Router, RouterOutlet } from "@angular/router";
import { LoadingService } from "./services/loading.service";
import { Toast } from "primeng/toast";
import { SpinnerComponent } from "./shared/spinner/spinner.component";
import { ConfirmDialog } from "primeng/confirmdialog";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, Toast, SpinnerComponent, ConfirmDialog],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {

  loading = false;
  constructor(
    private router: Router,
    public loader: LoadingService,
  ) {}

  ngOnInit() {
    const token = localStorage.getItem("token");
    const lastRoute = localStorage.getItem("lastRoute");
    const allowedWithoutToken = ["/", "/login"];

    if (token && lastRoute && !allowedWithoutToken.includes(lastRoute)) {
      this.router.navigateByUrl(lastRoute);
    }
  }

  isLoggedIn() {
    return !!localStorage.getItem("token");
  }
}
