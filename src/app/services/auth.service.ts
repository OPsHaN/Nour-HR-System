import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { MessageService } from "primeng/api";

export interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

    private baseUrl = "https://hrnourtest.runasp.net/api/auth/";

    private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn.asObservable();
  private _userType = new BehaviorSubject<number>(0); // رقم الدور
  userType$ = this._userType.asObservable();
  activePage: string = "desktop";

  constructor(
    private http: HttpClient,
    public router: Router,
    private messageService: MessageService
  ) {
    const token = localStorage.getItem("token");
    if (token) {
      this._isLoggedIn.next(true);
      this.initUserTypeFromToken();
    }

  }

getDecodedToken(): any {
  const token = localStorage.getItem("token");

  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null; // مش JWT صحيح

  const payload = parts[1];

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = atob(base64);


    return JSON.parse(decodedPayload);
  } catch (e) {
    console.error("Invalid token format", e);
    return null;
  }
}
  
  initUserTypeFromToken() {
  const decoded = this.getDecodedToken();
  if (decoded?.Type) {
    this._userType.next(decoded.Type);
  }
}

  login(data: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}Regsiter
`,
      data
    );
  }

  onLoginSuccess(token: string) {
    localStorage.setItem("token", token);
    this._isLoggedIn.next(true);
  }

  get userType(): number | null {
    return this.getDecodedToken()?.Type ?? null;
  }

  get userId(): number {
    return this.getDecodedToken()?.UserId ?? 0;
  }

  setUserType(type: number) {
    this._userType.next(type);
  }

  logout() {
    const token = localStorage.getItem("token");

    // ✅ لو المستخدم مش داخل أصلاً، اكتفي بتسجيل الخروج المحلي
    if (!token) {
      this.handleLocalLogout();
      return;
    }

    // 👇 إرسال طلب الخروج للسيرفر (بدون تأثير من الـ interceptor)
    this.http.post(`${this.baseUrl}logout`, {}).subscribe({
      next: () => {
        this.handleLocalLogout();
      },
      error: (err) => {
        console.warn("Logout API error:", err);
        // حتى لو حصل خطأ، نكمل تسجيل الخروج محليًا
        this.handleLocalLogout();
      },
    });
  }

  /** ✅ دالة واحدة تنفذ تسجيل الخروج المحلي بالكامل */
  private handleLocalLogout() {
    localStorage.clear();
    this._isLoggedIn.next(false);
    this.activePage = "desktop";

    // استخدم navigateByUrdesktop لتفادي أي مشاكل في إعادة التوجيه
    this.router.navigateByUrl("/login");
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


