import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { ConfirmationService, MessageService } from "primeng/api";

import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";
import { importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from "@angular/core";
import { ToastModule } from "primeng/toast";
import { authInterceptor } from "./app/shared/interceptor/auth.interceptor";
import { loadingInterceptor } from "./app/shared/interceptor/loading.interceptor";
import { providePrimeNG } from "primeng/config";
import { provideAnimations } from "@angular/platform-browser/animations";
import Lara from '@primeng/themes/lara';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(ToastModule),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    ConfirmationService,
    provideAnimations(),
    providePrimeNG({
      theme: { preset: Lara },
    }),
    provideHttpClient(withInterceptors([authInterceptor, loadingInterceptor])),
    MessageService,
  ],
}).catch((err) => console.error(err));
