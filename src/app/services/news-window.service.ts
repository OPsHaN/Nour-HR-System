import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";

@Injectable({
  providedIn: "root",
})
export class NewsWindow {
  private selectedNewsSource = new BehaviorSubject<any>(null);

  selectedNews$ = this.selectedNewsSource.asObservable();

  openNews(news: any) {
    this.selectedNewsSource.next(news);
  }
}
