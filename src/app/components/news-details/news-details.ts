import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Apiservice } from "src/app/services/api.service";
import { NewsWindow } from "src/app/services/news-window.service";

@Component({
  selector: "app-news-details",
  imports: [CommonModule],
  templateUrl: "./news-details.html",
  styleUrl: "./news-details.css",
})
export class NewsDetails {
  news: any;
newsList: any[] = [];

  constructor(private newsWindow: NewsWindow , private newsService: Apiservice) {}
  ngOnInit() {
      this.newsService.getNews(21, 10)
    .subscribe((res: any) => {
      this.newsList = res.data;
    });
    this.newsWindow.selectedNews$.subscribe((news) => {
      this.news = news;
    });
  }

  openNews(uuid: string) {

  this.newsService.getIdOfNews(uuid)
    .subscribe((res: any) => {
      this.news = res;
    });

}
}
