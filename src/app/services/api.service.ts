import { Employees } from "./../components/employees/employees";
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

  changePassword(id: number, password: string) {
    return this.http.put(`${this.baseUrl}auth/users/${id}/password`, {
      NewPassword: password,
    });
  }

  changeStatus(id: number, status: boolean) {
    return this.http.put(`${this.baseUrl}auth/users/${id}/toggle`, { status });
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

  endOfServiceEmployee(id: string, employeeData: any) {
    return this.http.put(
      `${this.baseUrl}employees/${id}/end-of-service`,
      employeeData,
    );
  }

  getAllEmployees(page: number, pagesize: number) {
    return this.http.get(
      `${this.baseUrl}employees?page=${page}&pageSize=${pagesize}`,
    );
  }

  getAllEmployeesByBranch(page: number, pagesize: number, branchId: string) {
    return this.http.get(
      `${this.baseUrl}employees?page=${page}&pageSize=${pagesize}&branchId=${branchId}`,
    );
  }

  gettAllEmployessByBank(page: number, pagesize: number, bankId: string) {
    return this.http.get(
      `${this.baseUrl}employees?page=${page}&pageSize=${pagesize}&bankId=${bankId}`,
    );
  }

  getAllEmployessByRole(page: number, pagesize: number, role: string) {
    return this.http.get(
      `${this.baseUrl}employees?page=${page}&pageSize=${pagesize}&role=${role}`,
    );
  }

  getAllEmployessWithAllFilters(
    page: number,
    pagesize: number,
    branchId: string,
    bankId: string,
    role: string,
  ) {
    return this.http.get(
      `${this.baseUrl}employees?page=${page}&pageSize=${pagesize}&branchId=${branchId}&bankId=${bankId}&role=${role}`,
    );
  }

  getAllEmployessByName(page: number, pagesize: number, name: string) {
    return this.http.get(
      `${this.baseUrl}employees?page=${page}&pageSize=${pagesize}&name=${name}`,
    );
  }

  getHistoryByEmployeeId(id: string) {
    return this.http.get(`${this.baseUrl}employees/${id}/history`);
  }

  getScheduleByEmployeeId(id: string) {
    return this.http.get(`${this.baseUrl}employees/${id}/schedule`);
  }

  addScheduleByEmployeeId(id: string, scheduleData: any) {
    return this.http.post(
      `${this.baseUrl}employees/${id}/schedule`,
      scheduleData,
    );
  }

  updateScheduleByEmployeeId(id: string, id2: string, scheduleData: any) {
    return this.http.put(
      `${this.baseUrl}employees/${id}/schedule/${id2}`,
      scheduleData,
    );
  }

  deleteScheduleByEmployeeIdAndId(id: string, id2: string) {
    return this.http.delete(
      `${this.baseUrl}employees/${id}/schedule/${id2}`,
      {},
    );
  }

  getMonthyDataForuser(id: string) {
    return this.http.get(`${this.baseUrl}payroll/${id}/current`);
  }

  getmonthlyDataForuserByMonth(id: string, month: number, year: number) {
    return this.http.get(`${this.baseUrl}payroll/${id}/${month}/${year}`);
  }

  updateMonthlyDtataForUser(id: string, data: any) {
    return this.http.put(`${this.baseUrl}payroll/${id}/monthly-data`, data);
  }

  addDiscount(data: any) {
    return this.http.post(`${this.baseUrl}payroll/discount`, data);
  }

  addContractDiscount(data: any) {
    return this.http.post(`${this.baseUrl}payroll/contract-discount`, data);
  }

  addBonus(data: any) {
    return this.http.post(`${this.baseUrl}payroll/bonus`, data);
  }

  addCashBorrow(data: any) {
    return this.http.post(`${this.baseUrl}payroll/cash-borrow`, data);
  }

  deleteDiscount(id: number) {
    return this.http.delete(`${this.baseUrl}payroll/discount/${id}`, {});
  }

  deleteContractDiscount(id: number) {
    return this.http.delete(
      `${this.baseUrl}payroll/contract-discount/${id}`,
      {},
    );
  }

  deleteBonus(id: number) {
    return this.http.delete(`${this.baseUrl}payroll/bonus/${id}`, {});
  }

  deleteCashBorrow(id: number) {
    return this.http.delete(`${this.baseUrl}payroll/cash-borrow/${id}`, {});
  }

  getAllMonthlyData(month: number, year: number) {
    return this.http.get(
      `${this.baseUrl}payroll/monthly-data?month=${month}&year=${year}`,
    );
  }

  getAllMonthlyDatabyBranch(month: number, year: number, branchId: string) {
    return this.http.get(
      `${this.baseUrl}payroll/monthly-data?month=${month}&year=${year}&branchId=${branchId}`,
    );
  }

  addEvaluations(data: any) {
    return this.http.post(`${this.baseUrl}evaluations`, data);
  }

  getEvaluations(empolyeeId: number) {
    return this.http.get(`${this.baseUrl}evaluations/${empolyeeId}`);
  }

  getEmployeeHistory(id: number) {
    return this.http.get(`${this.baseUrl}employees/${id}/branches`);
  }

  //branches//

  addNewBranch(branchData: any) {
    return this.http.post(`${this.baseUrl}branches`, branchData);
  }

  deleteBranch(id: string, branchData: any) {
    return this.http.delete(`${this.baseUrl}branches/${id}`, {
      body: branchData,
    });
  }

  getAllBranches(page: number, pagesize: number) {
    return this.http.get(
      `${this.baseUrl}branches?page=${page}&pageSize=${pagesize}`,
    );
  }

  //criteria

  getAllCriteria(page: number, pagesize: number) {
    return this.http.get(
      `${this.baseUrl}evaluation-criteria?page=${page}&pageSize=${pagesize}`,
    );
  }

  addNewCriteria(criteriaData: any) {
    return this.http.post(`${this.baseUrl}evaluation-criteria`, criteriaData);
  }

  deleteCriteria(id: string, criteriaData: any) {
    return this.http.delete(`${this.baseUrl}evaluation-criteria/${id}`, {
      body: criteriaData,
    });
  }

  //banks//

  addNewBank(bankData: any) {
    return this.http.post(`${this.baseUrl}banks`, bankData);
  }

  deleteBank(id: string) {
    return this.http.delete(`${this.baseUrl}banks/${id}`, {});
  }

  getAllBanks() {
    return this.http.get(`${this.baseUrl}banks`);
  }

  //bulk//

  addBulkBonus(employees: any) {
    return this.http.post(`${this.baseUrl}payroll/bonus/bulk`, employees);
  }

  addBulkDiscount(employees: any) {
    return this.http.post(`${this.baseUrl}payroll/discount/bulk`, employees);
  }

  addBulkVariedDiscount(employees: any) {
    return this.http.post(
      `${this.baseUrl}payroll/discount/bulk-varied`,
      employees,
    );
  }

  addBulkVariedContractDiscount(employees: any) {
    return this.http.post(
      `${this.baseUrl}payroll/contract-discount/bulk-varied`,
      employees,
    );
  }

  addBulkVariedBonus(employess: any) {
    return this.http.post(
      `${this.baseUrl}payroll/bonus/bulk-varied`,
      employess,
    );
  }

  //reports//

  getAllShifts(fromDate: string) {
    return this.http.get(
      `${this.baseUrl}attendance/reports?type=all&fromDate=${fromDate}`,
    );
  }

  getAllOpenAndLateShifts(type: string) {
    return this.http.get(`${this.baseUrl}attendance/reports?type=${type}`);
  }

  getAbsentEmployees(fromDate: string, toDate: string) {
    return this.http.get(`${this.baseUrl}attendance/reports/absent?fromDate=${fromDate}&toDate=${toDate}`);
  }

  startShift(){
    return this.http.post(
      `${this.baseUrl}attendance/start`, {}
    );
  }

  endShift(){
    return this.http.post(
      `${this.baseUrl}attendance/end`, {}
    );
  }

  getMyShifts(fromDate: string, toDate: string) {
    return this.http.get(`${this.baseUrl}attendance/my-shifts?fromDate=${fromDate}&toDate=${toDate}`);

  }

  getAllReportsForEmpolyee(employeeId: number) {
    return this.http.get(`${this.baseUrl}payroll/${employeeId}/details`);
  }

  getAllReportsForEmpolyeeInMonthAndYear(
    employeeId: number,
    month: number,
    year: number,
  ) {
    return this.http.get(
      `${this.baseUrl}payroll/${employeeId}/details?month=${month}&year=${year}`,
    );
  }

addDeductionCalculator(body: { employeeIds: number[] }) {
  return this.http.post(`${this.baseUrl}payroll/deduction-calculator`, body);
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
