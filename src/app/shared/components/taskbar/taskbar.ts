import { CommonModule } from "@angular/common";
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from "@angular/core";
import { DesktopWindow } from "../../desktop-window.model";
import { MessageService } from "primeng/api";
import { Router } from "@angular/router";
import { ConfirmationService } from "primeng/api";
import { getShortcutTheme, WindowAction } from "../../shortcut.config";

@Component({
  selector: "app-taskbar",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./taskbar.html",
  styleUrl: "./taskbar.css",
})
export class TaskbarComponent implements OnInit, OnDestroy, OnChanges {
  @Input() windows: DesktopWindow[] = [];
  @Input() isDark = false;

  @Output() taskClick = new EventEmitter<number>();
  @Output() themeChange = new EventEmitter<boolean>();

  protected timeLabel = "";
  protected dateLabel = "";
  protected readonly locale = "ar-SA";

  protected themeToggle = false;

  private intervalId?: ReturnType<typeof setInterval>;

  protected getTheme(action: WindowAction) {
    return getShortcutTheme(action);
  }

  constructor(
    public router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.updateClock();
    this.intervalId = setInterval(() => this.updateClock(), 1000);
    this.themeToggle = this.isDark;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isDark"]) {
      this.themeToggle = this.isDark;
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  protected onTaskClick(id: number): void {
    this.taskClick.emit(id);
  }

  protected onThemeChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    this.themeToggle = isChecked;
    this.themeChange.emit(isChecked);
  }

  logout() {
    this.confirmationService.confirm({
      message: "هل تريد تسجيل الخروج؟",
      header: "تأكيد",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "نعم",
      rejectLabel: "لا",
      accept: () => {
        localStorage.clear();
        this.router.navigate(["/login"]);
        this.showSuccess("تم تسجيل الخروج بنجاح");
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

  private updateClock(): void {
    const now = new Date();

    this.timeLabel = now.toLocaleTimeString(this.locale, {
      hour: "2-digit",
      minute: "2-digit",
    });

    this.dateLabel = now.toLocaleDateString(this.locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
}
