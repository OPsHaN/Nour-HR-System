import { Type } from "@angular/core";
import { BrowserComponent } from "../components/browser/browser.component";
import { CalendarComponent } from "../components/calendar/calendar.component";
import { DownloadComponent } from "../components/download/download.component";
import { CreateUser } from "../components/create-user/create-user";
import { Employees } from "../components/employees/employees";

export const WINDOW_REGISTRY: Record<string, Type<any>> = {
  calendar: CalendarComponent,
  employees: Employees,
  createUser: CreateUser,
  download: DownloadComponent,
};