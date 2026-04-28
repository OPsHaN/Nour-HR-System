import { inject, Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpHandler,
  HttpHandlerFn,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { finalize } from "rxjs";
import { LoadingService } from "src/app/services/loading.service";

export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const loadingService = inject(LoadingService);

  const shouldIgnoreSpinner = req.headers.has('ignore-spinner');

  if (shouldIgnoreSpinner) {
    const cleanReq = req.clone({
      headers: req.headers.delete('ignore-spinner'),
    });
    return next(cleanReq);
  }

  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    })
  );
};



