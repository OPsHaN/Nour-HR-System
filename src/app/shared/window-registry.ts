import { Type } from "@angular/core";
import { CalendarComponent } from "../components/calendar/calendar.component";
import { Reports } from "../components/reports/reports";
import { Users } from "../components/users/users";
import { Employees } from "../components/employees/employees";
import { Branches } from "../components/branches/branches";
import { Criteria } from "../components/criteria/criteria";
import { Banks } from "../components/banks/banks";
import { Orders } from "../components/orders-component/orders/orders";
import { Complaint } from "../components/complaint/complaint";
import { Responsibility } from "../components/responsibility/responsibility";
import { MyShift } from "../components/my-shift/my-shift";
import { WebsiteComponent } from "./components/website/website.component";

export const WINDOW_REGISTRY: Record<string, Type<any>> = {
  calendar: CalendarComponent,
  users: Users,
  branches: Branches,
  employees:Employees,
  reports: Reports,
  criteria:Criteria,
  banks:Banks,
  orders:Orders,
  complaints:Complaint,
  responsibility:Responsibility,
  myshift:MyShift,
  website: WebsiteComponent,  
};