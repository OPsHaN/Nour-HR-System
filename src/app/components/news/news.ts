import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Apiservice } from "src/app/services/api.service";
import { FormsModule } from "@angular/forms";
import { BehaviorSubject, interval, Subscription } from "rxjs";
import { DialogModule } from "primeng/dialog";
import { Output, EventEmitter } from "@angular/core";
import { NewsWindow } from "src/app/services/news-window.service";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
}
@Component({
  selector: "app-news",
  imports: [FormsModule, CommonModule, DialogModule],
  templateUrl: "./news.html",
  styleUrl: "./news.css",
})
export class News {
  articles: NewsItem[] = [];
  totalCount = 0;
  currentPage = 1;
  pageSize = 100;
  isLoading = false;
  newsList: any[] = [];
  private rotationSubscription?: Subscription;
  private currentIndex = 0;
  currentNews: any;
  showNewsDialog = false;
  selectedNews: any;
  showAllNewsDialog = false;
  constructor(
    private newsService: Apiservice,
    private cdr: ChangeDetectorRef,
    private newsWindow: NewsWindow,
  ) {}

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews() {
    this.newsService
      .getNews(this.currentPage, this.pageSize)
      .subscribe((res: any) => {
        this.newsList = res.data;

        if (this.newsList.length) {
          this.currentNews = this.newsList[0];

          this.cdr.detectChanges();

          this.rotationSubscription = interval(5000).subscribe(() => {
            this.currentIndex++;

            if (this.currentIndex >= this.newsList.length) {
              this.currentIndex = 0;
            }

            this.currentNews = this.newsList[this.currentIndex];

            this.cdr.detectChanges();
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.rotationSubscription?.unsubscribe();
  }

  openNews(uuid: string) {
    this.newsService.getIdOfNews(uuid).subscribe((res: any) => {
      this.newsWindow.openNews(res);

      window.dispatchEvent(new CustomEvent("open-news-window"));

      this.showNewsDialog = true;
      this.cdr.detectChanges();
    });
  }

openAllNews() {

  this.newsService
      .getNews(this.currentPage, this.pageSize)
    .subscribe((res: any) => {

      this.newsList = res.data;

      this.newsWindow.openNews({
        type: 'all-news',
        news: this.newsList
      });

      window.dispatchEvent(
        new CustomEvent('open-news-window')
      );

    });

}
}
