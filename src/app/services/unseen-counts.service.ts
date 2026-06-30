// unseen-counts.service.ts
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Apiservice } from "src/app/services/api.service";

export interface UnseenCounts {
  overtime: number;
  borrows: number;
  holidays: number;
  resignations: number;
  appointments: number;
  forgotHours: number;
  complaints: number;
}

const INITIAL_COUNTS: UnseenCounts = {
  overtime: 0,
  borrows: 0,
  holidays: 0,
  resignations: 0,
  appointments: 0,
  forgotHours: 0,
  complaints: 0,
};

@Injectable({ providedIn: "root" })
export class UnseenCountsService {
  private countsSubject = new BehaviorSubject<UnseenCounts>(INITIAL_COUNTS);
  counts$ = this.countsSubject.asObservable();

  constructor(private api: Apiservice) {}

  get current(): UnseenCounts {
    return this.countsSubject.value;
  }

  private patch(partial: Partial<UnseenCounts>) {
    this.countsSubject.next({ ...this.countsSubject.value, ...partial });
  }

   refreshAll(includeAll: boolean = true) {
    this.api.getUnseenOvertimeRequestsCount().subscribe((res: any) => {
      this.patch({ overtime: res.count ?? 0 });
    });
 
    if (!includeAll) {
      return;
    }
 
    this.api.getUnseenBorrowsCount().subscribe((res: any) => {
      this.patch({ borrows: res.count ?? 0 });
    });
 
    this.api.getUnseenHolidayRequestsCount().subscribe((res: any) => {
      this.patch({ holidays: res.count ?? 0 });
    });
 
    this.api.getUnseenResignationRequestsCount().subscribe((res: any) => {
      this.patch({ resignations: res.count ?? 0 });
    });
 
    this.api.getUnseenAppointmentRequestsCount().subscribe((res: any) => {
      this.patch({ appointments: res.count ?? 0 });
    });
 
    this.api.getUnseenForgetedHoursRequest().subscribe((res: any) => {
      this.patch({ forgotHours: res.count ?? 0 });
    });
 
    this.api.getUnseenComplaintsCount().subscribe((res: any) => {
      this.patch({ complaints: res.count ?? 0 });
    });
  }

}