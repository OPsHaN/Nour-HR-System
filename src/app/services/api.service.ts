import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";

@Injectable({
  providedIn: "root",
})
export class Apiservice {
  private baseUrl = "https://hrnourtest.runasp.net/api/";
  private readonly noSpinnerHeaders = new HttpHeaders({
    "ignore-spinner": "true",
  });

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

  getAllEmployees(
    page: number,
    pagesize: number,
    branchId = "",
    bankId = "",
    role = "",
  ) {
    let url = `${this.baseUrl}employees?page=${page}&pageSize=${pagesize}`;

    if (branchId) url += `&branchId=${branchId}`;
    if (bankId) url += `&bankId=${bankId}`;
    if (role) url += `&role=${role}`;

    return this.http.get(url);
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
    const params = new HttpParams()
      .set("page", page)
      .set("pageSize", pagesize)
      .set("name", name.trim());

    return this.http.get(`${this.baseUrl}employees`, { params });
  }


    getAllUsersByName(page: number, pagesize: number , name: string) {
    const params = new HttpParams()
      .set("page", page)
      .set("pageSize", pagesize)
      .set("name", name.trim());

    return this.http.get(`${this.baseUrl}auth/users`, { params });
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

  addInstallmentsBorrow(data: any) {
    return this.http.post(`${this.baseUrl}borrows/installment`, data);
  }

  getInstallmentsBorrow(employeeId:string){
    return this.http.get(`${this.baseUrl}borrows/installment/${employeeId}`)
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

  getAllShifts(fromDate: string, toDate?: string) {
    const endDate = toDate ?? fromDate;
    return this.http.get(
      `${this.baseUrl}attendance/reports?type=all&fromDate=${fromDate}&toDate=${endDate}`,
    );
  }

  getAllOpenAndLateShifts(type: string) {
    return this.http.get(`${this.baseUrl}attendance/reports?type=${type}`);
  }

getAbsentEmployees(fromDate: string, toDate: string, page: number = 1, pageSize: number = 10) {
  return this.http.get(
    `${this.baseUrl}attendance/reports/absent?fromDate=${fromDate}&toDate=${toDate}&page=${page}&pageSize=${pageSize}`,
  );
}

  startShift() {
    return this.http.post(`${this.baseUrl}attendance/start`, {});
  }

  endShift() {
    return this.http.post(`${this.baseUrl}attendance/end`, {});
  }

  getMyShifts(fromDate: string, toDate: string) {
    return this.http.get(
      `${this.baseUrl}attendance/my-shifts?fromDate=${fromDate}&toDate=${toDate}`,
    );
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

  //Responsibilities//

  getAllResponsibilities(employeeId: string) {
    return this.http.get(`${this.baseUrl}employees/${employeeId}/custody`);
  }

  addResponsibility(employeeId: string, responsibilityData: any) {
    return this.http.post(
      `${this.baseUrl}employees/${employeeId}/custody`,
      responsibilityData,
    );
  }

  deleteResponsibility(employeeId: string, responsibilityId: string) {
    return this.http.delete(
      `${this.baseUrl}employees/${employeeId}/custody/${responsibilityId}`,
      {},
    );
  }

  //complaints//

  addComplaint(complaintData: any) {
    return this.http.post(`${this.baseUrl}complaints`, complaintData);
  }

  getAllComplaints() {
    return this.http.get(`${this.baseUrl}complaints`);
  }

  getAllComplaintsForUser(employeeId: string) {
    return this.http.get(`${this.baseUrl}complaints?employeeId=${employeeId}`);
  }

  respondToComplaint(complaintId: string, respond: any) {
    return this.http.put(
      `${this.baseUrl}complaints/${complaintId}/respond`,
      respond,
    );
  }

  getUnseenComplaintsCount() {
    return this.http.get(`${this.baseUrl}complaints/unseen-count`, {
      headers: this.noSpinnerHeaders,
    });
  }

  markComplaintAsSeen(complaintId: string) {
    return this.http.put(
      `${this.baseUrl}complaints/${complaintId}/mark-seen`,
      {},
    );
  }

  //forgeted-hours-requests//

  getForgetedHoursRequests(page: number, pageSize: number) {
    return this.http.get(
      `${this.baseUrl}forgeted-hours?page=${page}&pageSize=${pageSize}`,
    );
  }

  getForgetedHoursRequestsForUser(
    employeeId: string,
    page: number,
    pageSize: number,
  ) {
    return this.http.get(
      `${this.baseUrl}forgeted-hours?employeeId=${employeeId}&page=${page}&pageSize=${pageSize}`,
    );
  }

  addForgetedHoursRequest(requestData: any) {
    return this.http.post(`${this.baseUrl}forgeted-hours`, requestData);
  }

  approveForgetedHoursRequest(id: string, data: any) {
    return this.http.put(`${this.baseUrl}forgeted-hours/${id}/approve`, data);
  }

  rejectForgetedHoursRequest(requestId: string, data: any) {
    return this.http.put(
      `${this.baseUrl}forgeted-hours/${requestId}/approve-reject`,
      data,
    );
  }

  getUnseenForgetedHoursRequest() {
    return this.http.get(`${this.baseUrl}forgeted-hours/unseen-count`, {
      headers: this.noSpinnerHeaders,
    });
  }

  markForgetedHoursRequestAsSeen(requestId: string) {
    return this.http.put(
      `${this.baseUrl}forgeted-hours/${requestId}/mark-seen`,
      {},
    );
  }

  //holiday //

  addHoliday(holidayData: any) {
    return this.http.post(`${this.baseUrl}holidays`, holidayData);
  }

  getAllHolidays(page: number, pageSize: number) {
    return this.http.get(
      `${this.baseUrl}holidays?page=${page}&pageSize=${pageSize}`,
    );
  }

  getAllHolidaysForUser(employeeId: string, page: number, pageSize: number) {
    return this.http.get(
      `${this.baseUrl}holidays?employeeId=${employeeId}&page=${page}&pageSize=${pageSize}`,
    );
  }

  approveHolidayRequestByHr(requestId: string, data: any) {
    return this.http.put(
      `${this.baseUrl}holidays/${requestId}/hr-approve`,
      data,
    );
  }

  approveHolidayRequestByAreaManager(requestId: string, data: any) {
    return this.http.put(
      `${this.baseUrl}holidays/${requestId}/area-manager-approve`,
      data,
    );
  }

  getUnseenHolidayRequestsCount() {
    return this.http.get(`${this.baseUrl}holidays/unseen-count`, {
      headers: this.noSpinnerHeaders,
    });
  }

  markHolidayRequestAsSeen(requestId: string) {
    return this.http.put(`${this.baseUrl}holidays/${requestId}/mark-seen`, {});
  }

  //borrow//

  addBorrow(borrowData: any) {
    return this.http.post(`${this.baseUrl}borrows`, borrowData);
  }

  getAllBorrows(page: number, pageSize: number) {
    return this.http.get(
      `${this.baseUrl}borrows?page=${page}&pageSize=${pageSize}`,
    );
  }

  getAllBorrowsForUser(employeeId: string, page: number, pageSize: number) {
    return this.http.get(
      `${this.baseUrl}borrows?employeeId=${employeeId}&page=${page}&pageSize=${pageSize}`,
    );
  }

  approveOrRejectBorrowRequest(requestId: string, data: any) {
    return this.http.put(
      `${this.baseUrl}borrows/${requestId}/approve-reject`,
      data,
    );
  }

  getUnseenBorrowsCount() {
    return this.http.get(`${this.baseUrl}borrows/unseen-count`, {
      headers: this.noSpinnerHeaders,
    });
  }

  markBorrowAsSeen(requestId: string) {
    return this.http.put(`${this.baseUrl}borrows/${requestId}/mark-seen`, {});
  }

  //overtime//

  addOvertime(overtimeData: any) {
    return this.http.post(`${this.baseUrl}overtime`, overtimeData);
  }

  getAllOvertime(page: number, pageSize: number) {
    return this.http.get(
      `${this.baseUrl}overtime?page=${page}&pageSize=${pageSize}`,
    );
  }

  getAllOvertimeForUser(employeeId: string, page: number, pageSize: number) {
    return this.http.get(
      `${this.baseUrl}overtime?employeeId=${employeeId}&page=${page}&pageSize=${pageSize}`,
    );
  }

  approveByHrOvertimeRequest(requestId: string, data: any) {
    return this.http.put(
      `${this.baseUrl}overtime/${requestId}/hr-approve`,
      data,
    );
  }

  approveByAreaManagerOvertimeRequest(requestId: string, data: any) {
    return this.http.put(
      `${this.baseUrl}overtime/${requestId}/area-manager-approve`,
      data,
    );
  }

  approveByControlOvertimeRequest(requestId: string, data: any) {
    return this.http.put(
      `${this.baseUrl}overtime/${requestId}/control-approve`,
      data,
    );
  }

  getUnseenOvertimeRequestsCount() {
    return this.http.get(`${this.baseUrl}overtime/unseen-count`, {
      headers: this.noSpinnerHeaders,
    });
  }

  markOvertimeRequestAsSeen(requestId: string) {
    return this.http.put(`${this.baseUrl}overtime/${requestId}/mark-seen`, {});
  }

  //resignation//

  addResignation(resignationData: any) {
    return this.http.post(`${this.baseUrl}resignations`, resignationData);
  }

  getAllResignations(page: number, pageSize: number) {
    return this.http.get(
      `${this.baseUrl}resignations?page=${page}&pageSize=${pageSize}`,
    );
  }

  getAllResignationsForUser(
    employeeId: string,
    page: number,
    pageSize: number,
  ) {
    return this.http.get(
      `${this.baseUrl}resignations?employeeId=${employeeId}&page=${page}&pageSize=${pageSize}`,
    );
  }

  approveResignationRequest(requestId: string, data: any) {
    return this.http.put(
      `${this.baseUrl}resignations/${requestId}/approve-reject`,
      data,
    );
  }

  getUnseenResignationRequestsCount() {
    return this.http.get(`${this.baseUrl}resignations/unseen-count`, {
      headers: this.noSpinnerHeaders,
    });
  }

  markResignationRequestAsSeen(requestId: string) {
    return this.http.put(
      `${this.baseUrl}resignations/${requestId}/mark-seen`,
      {},
    );
  }

  //appointment//

  addAppointment(appointmentData: any) {
    return this.http.post(`${this.baseUrl}appointments`, appointmentData);
  }

  getAllAppointments(page: number, pageSize: number) {
    return this.http.get(
      `${this.baseUrl}appointments?page=${page}&pageSize=${pageSize}`,
    );
  }

  getAllAppointmentsForUser(
    employeeId: string,
    page: number,
    pageSize: number,
  ) {
    return this.http.get(
      `${this.baseUrl}appointments?employeeId=${employeeId}&page=${page}&pageSize=${pageSize}`,
    );
  }

  approveAppointmentRequest(requestId: string, data: any) {
    return this.http.put(
      `${this.baseUrl}appointments/${requestId}/approve-reject`,
      data,
    );
  }

  getUnseenAppointmentRequestsCount() {
    return this.http.get(`${this.baseUrl}appointments/unseen-count`, {
      headers: this.noSpinnerHeaders,
    });
  }

  markAppointmentRequestAsSeen(requestId: string) {
    return this.http.put(
      `${this.baseUrl}appointments/${requestId}/mark-seen`,
      {},
    );
  }

  //news//

  getNews(page: number, pageSize: number) {
    return this.http.get(
      `${this.baseUrl}news?page=${page}&pageSize=${pageSize}`,
    );
  }

  getIdOfNews(uuid: string) {
    return this.http.get(`${this.baseUrl}news/${uuid}`);
  }

  //logs//

  getAllLogs() {
    return this.http.get(`${this.baseUrl}audit`);
  }

  //areamanagers//

  getBranchesForAreaManagers(uuid: string) {
    return this.http.get(`${this.baseUrl}auth/users/${uuid}/branches`);
  }

  addBranchesToAreaManagers(uuid: string, banchId: number) {
    return this.http.post(
      `${this.baseUrl}auth/users/${uuid}/branches/${banchId}`,
      {},
    );
  }

  deleteBracnhesAreaManagers(uuid: string, banchId: number) {
    return this.http.delete(
      `${this.baseUrl}auth/users/${uuid}/branches/${banchId}`,
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
