import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";

@Injectable({
  providedIn: "root",
})
export class Apiservice {
  private baseUrl = "https://hrnourtest.runasp.net/api/";

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
  ) {}

  //users//

  createUser(userData: any) {
    return this.http.post(`${this.baseUrl}auth/CreateUser`, userData);
  }

  getAllUsers(page: number, pagesize: number) {
    return this.http.get(
      `${this.baseUrl}auth/users?page=${page}&pageSize=${pagesize}`,
    );
  }

   changePassword(id: number) {
    return this.http.put(`${this.baseUrl}users/${id}/password`, {});
  }


  //employees//

  addNewEmployee(employeeData: any) {
    return this.http.post(`${this.baseUrl}employees`, employeeData);
  }

  editEmployee(id: string, employeeData: any) {
    return this.http.put(`${this.baseUrl}employees/${id}`, employeeData);
  }

  getEmployeeById(id: string) {
    return this.http.get(`${this.baseUrl}employees/${id}`);
  }

  updateEmployee(id: string, employeeData: any) {
    return this.http.put(`${this.baseUrl}employees/${id}/end-of-service`, employeeData);
  }

  getAllEmployees(page: number, pagesize: number) {
    return this.http.get(
      `${this.baseUrl}employees?page=${page}&pageSize=${pagesize}`,
    );
  }


  //branches//

  addNewBranch(branchData: any) {
    return this.http.post(`${this.baseUrl}branches`, branchData);
  }

  editBranch(id: string, branchData: any) {
    return this.http.put(`${this.baseUrl}branches/${id}`, branchData);
  }

  getAllBranches(page: number, pagesize: number) {
    return this.http.get(`${this.baseUrl}branches?page=${page}&pageSize=${pagesize}`);
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
