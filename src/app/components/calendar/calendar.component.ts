import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent implements OnInit {

  protected readonly monthNames = [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ];

  protected readonly weekdays = [
    'الأحد',
    'الإثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
  ];

  protected calendarDate = new Date();

  ngOnInit(): void {
    this.calendarDate = new Date();
  }

 

  protected get calendarWeeks(): Array<Array<Date | null>> {
    const year = this.calendarDate.getFullYear();
    const month = this.calendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: Array<Date | null> = [];

    // بداية الشهر
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // أيام الشهر
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    // نهاية الشهر
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    const weeks: Array<Array<Date | null>> = [];

    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  }

  protected today(): Date {
    return new Date();
  }

  protected previousMonth(): void {
    this.calendarDate = new Date(
      this.calendarDate.getFullYear(),
      this.calendarDate.getMonth() - 1,
      1
    );
  }

  protected nextMonth(): void {
    this.calendarDate = new Date(
      this.calendarDate.getFullYear(),
      this.calendarDate.getMonth() + 1,
      1
    );
  }

  protected resetCalendar(): void {
    this.calendarDate = new Date();
  }

  protected clearCalendarSelection(): void {
    this.calendarDate = new Date();
  }

  protected get calendarTitle(): string {
  const month = this.monthNames[this.calendarDate.getMonth()];

  const year = this.calendarDate
    .getFullYear()
    .toLocaleString('ar-EG');

  return `${month} ${year}`;
}
}