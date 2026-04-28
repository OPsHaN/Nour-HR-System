import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  // الحالة العامة للتحميل (true = فى تحميل)
  isLoading = new BehaviorSubject<boolean>(false);

  // عدد الطلبات الجارية
  private activeRequests = 0;

  // دوال يتم استدعائها بعد انتهاء جميع الطلبات
  private afterLoadAllRequestsFunctions: (() => void)[] = [];

show() {
  this.activeRequests++;
  Promise.resolve().then(() => {
    this.isLoading.next(true);
  });
}

hide() {
  if (this.activeRequests > 0) this.activeRequests--;

  if (this.activeRequests === 0) {
    Promise.resolve().then(() => {
      this.isLoading.next(false);
      this.handleAfterAllRequestsFunctions();
    });
  }
}


  addAfterAllRequestsHandler(fn: () => void) {
    this.afterLoadAllRequestsFunctions.push(fn);
  }

   handleAfterAllRequestsFunctions() {
    this.afterLoadAllRequestsFunctions.forEach(fn => fn());
    this.afterLoadAllRequestsFunctions = []; // تفريغ بعد التنفيذ
  }
}
