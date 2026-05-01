import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  isLoading = new BehaviorSubject<boolean>(false);
  private activeRequests = 0;
  private afterLoadAllRequestsFunctions: (() => void)[] = [];

  show() {
    this.activeRequests++;
    this.isLoading.next(true); 
  }

  hide() {
    if (this.activeRequests > 0) this.activeRequests--;

    if (this.activeRequests === 0) {
      this.isLoading.next(false); 
      this.handleAfterAllRequestsFunctions();
    }
  }

  addAfterAllRequestsHandler(fn: () => void) {
    this.afterLoadAllRequestsFunctions.push(fn);
  }

  handleAfterAllRequestsFunctions() {
    this.afterLoadAllRequestsFunctions.forEach(fn => fn());
    this.afterLoadAllRequestsFunctions = [];
  }
}