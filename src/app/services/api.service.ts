import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";

@Injectable({
  providedIn: "root",
})
export class Apiservice {
  private baseUrl = "https://hrnourtest.runasp.net/api/auth/";

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
  ) {}

  createUser(userData: any) {
    return this.http.post(`${this.baseUrl}CreateUser`, userData);
  }

  getAllUsers(pagesize: number, page: number) {
    return this.http.get(
      `${this.baseUrl}users?page=${page}&pageSize=${pagesize}`,
    );
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
