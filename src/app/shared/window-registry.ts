import { Type } from "@angular/core";
import { CalendarComponent } from "../components/calendar/calendar.component";
import { DownloadComponent } from "../components/download/download.component";
import { CreateUser } from "../components/create-user/create-user";
import { Users } from "../components/users/users";
import { Employees } from "../components/employees/employees";

export const WINDOW_REGISTRY: Record<string, Type<any>> = {
  calendar: CalendarComponent,
  users: Users,
  createUser: CreateUser,
  employees:Employees,
  download: DownloadComponent,
};