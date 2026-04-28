import { Type } from "@angular/core";
import { BrowserComponent } from "../browser/browser.component";
import { CalendarComponent } from "../calendar/calendar.component";
import { DownloadComponent } from "../download/download.component";
import { FilesComponent } from "../files/files.component";

export const WINDOW_REGISTRY: Record<string, Type<any>> = {
  calendar: CalendarComponent,
  browser: BrowserComponent,
  files: FilesComponent,
  download: DownloadComponent,
};