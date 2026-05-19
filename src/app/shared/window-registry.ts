import { Type } from "@angular/core";
import { CalendarComponent } from "../components/calendar/calendar.component";
import { DownloadComponent } from "../components/download/download.component";
import { Users } from "../components/users/users";
import { Employees } from "../components/employees/employees";
import { Branches } from "../components/branches/branches";
import { Criteria } from "../components/criteria/criteria";
import { Banks } from "../components/banks/banks";

export const WINDOW_REGISTRY: Record<string, Type<any>> = {
  calendar: CalendarComponent,
  users: Users,
  branches: Branches,
  employees:Employees,
  download: DownloadComponent,
  criteria:Criteria,
  banks:Banks
};