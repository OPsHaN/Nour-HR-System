import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { NewsWindow } from "src/app/services/news-window.service";

interface AdItem {
  id: number;
  title: string;
  description: string;
  image: string;
}

@Component({
  selector: "app-ads",
  imports: [CommonModule],
  templateUrl: "./ads.html",
  styleUrl: "./ads.css",
})
export class Ads implements OnInit, OnDestroy {
  ads: AdItem[] = [
    {
      id: 1,
      title: "الشمس والبحر مأثرين على شعرك؟☀️",
      description: `لو شعرك بقى أضعف، جاف أو بيتقصف مع الحر والرطوبة، دلوقتي الوقت المناسب تهتمي بيه.
اشتري قطعة واحصلي على الثانية بخصم 50% على منتجات StrongVille في صيدليات نور.
روتين متكامل يساعد على العناية بالشعر، ترطيبه، وتقليل مظهر التقصف والهيشان مع الاستخدام المنتظم.
العرض لمدة 3 أيام فقط (9 - 10 - 11 يوليو) بجميع فروع صيدليات نور.
الحقي العرض واهتمي بكثافة شعرك بنص التمن، اطلبي روتينك دلوقتي من خلال 🛒:
Hotline: 15805
www.nourpharmacies.com`,
      image: "/photos/1.jpeg",
    },
    {
      id: 2,
      title: "الصيف يكمل مع نور .. وحماية بشرتك من شمس المصيف ملهاش بديل☀️",
      description: `عشان تستمتعي بالبحر والتان من غير ما تقلقي من حروق الشمس، الجفاف، أو التصبغات، صيدليات نور عملتلك أقوى عرض على المنتجات المفضلة للجميع من BOBAI
🔥 اشتري قطعة واحصلي على الثانية بخصم 50% 🔥
العرض بيضم كل أنواع الحماية اللي بتناسب يومك في المصيف
⏳ العرض ساري لمدة 3 أيام بس (9 - 10 - 11 يوليو) بجميع فروعنا.
متفوتيش الفرصة، واطلبي دلوقتي من خلال 🛒:
📞 Hotline: 15805
🌐 www.nourpharmacies.com`,
      image: "/photos/2.jpeg",
    },
    {
      id: 3,
      title: "لو كنتِ مستنية تبدأي روتين لبشرتك .. فدي إشارة ليكي✨",
      description: `دلوقتي Buy 1 Get 1 على منتجات Vacation Skincare في صيدليات نور.
يعني عناية أكتر .. وتوفير أكتر
⏳ لفترة محدودة.
عرض زي ده مش بيتكرر كل يوم عناية متكاملة لبشرتك، والقطعة الثانية علينا 🎁🔥
اطلبي دلوقتي وحافظي على نضارة بشرتك من خلال 🛒:
📞 Hotline: 15805
🌐 www.nourpharmacies.com`,
      image: "/photos/3.jpeg",
    },
  ];

  currentIndex = 0;
  selectedAd: AdItem | null = null;
  private autoPlayTimer: any;

  constructor(
    private newsWindow: NewsWindow,
    private cdr: ChangeDetectorRef, // ⬅️ جديد
  ) {}

  ngOnInit(): void {
    this.selectedAd = this.ads[0];
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
  }

  startAutoPlay(): void {
    this.autoPlayTimer = setInterval(() => {
      this.next();
      this.cdr.detectChanges(); // ⬅️ نجبر الشاشة تترسم من غير ما ننتظر حركة الماوس
    }, 4000);
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.ads.length;
    this.selectedAd = this.ads[this.currentIndex];
  }

  prev(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.ads.length) % this.ads.length;
    this.selectedAd = this.ads[this.currentIndex];
    this.cdr.detectChanges(); // ⬅️ للأمان لو الضغط على الزر مش بيحدث تلقائي
  }

  openAd(ad: AdItem): void {
    this.selectedAd = ad;
    this.currentIndex = this.ads.findIndex((item) => item.id === ad.id);

    this.newsWindow.openNews({
      title: ad.title,
      description: ad.description,
      image: ad.image,
      type: "ad",
    });

    window.dispatchEvent(new CustomEvent("open-news-window"));
    this.cdr.detectChanges();
  }
}