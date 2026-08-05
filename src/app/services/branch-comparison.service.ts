import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface BranchPayrollComparisonRow {
  employeeId: number;
  employeeName: string;
  branchName: string;
  salary1: number;
  salary2: number;
  diff: number;
  percent: number;
}

export interface BranchPayrollComparisonState {
  branchId: string;
  branchName: string;
  month1: { month: number; year: number; label: string };
  month2: { month: number; year: number; label: string };
  rows: BranchPayrollComparisonRow[];
}

@Injectable({
  providedIn: 'root',
})
export class BranchComparisonService {
  private comparisonSubject = new BehaviorSubject<BranchPayrollComparisonState | null>(null);
  comparison$ = this.comparisonSubject.asObservable();

  setComparison(state: BranchPayrollComparisonState): void {
    this.comparisonSubject.next(state);
  }

  clearComparison(): void {
    this.comparisonSubject.next(null);
  }
}
