import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

interface BrowserState {
  currentInput: string;
  currentUrl: string;
  history: string[];
  historyIndex: number;
}

@Component({
  selector: 'app-browser',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './browser.component.html',
  styleUrl: './browser.component.css',
})
export class BrowserComponent {
  private readonly sanitizer = inject(DomSanitizer);

  protected browser: BrowserState = {
    currentInput: 'https://metroui.org.ua',
    currentUrl: 'https://metroui.org.ua',
    history: ['https://metroui.org.ua'],
    historyIndex: 0,
  };

  protected browserBack(): void {
    this.updateBrowserHistory(-1);
  }

  protected browserForward(): void {
    this.updateBrowserHistory(1);
  }

  protected browserHome(): void {
    this.navigateBrowser('https://metroui.org.ua');
  }

  protected browserGo(): void {
    this.navigateBrowser(this.browser.currentInput);
  }

  protected updateBrowserInput(value: string): void {
    this.browser.currentInput = value;
  }

  protected safeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private navigateBrowser(rawValue: string): void {
    const formatted = this.normalizeUrl(rawValue);
    const nextHistory = this.browser.history.slice(0, this.browser.historyIndex + 1);
    nextHistory.push(formatted);

    this.browser = {
      currentInput: formatted,
      currentUrl: formatted,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    };
  }

  private updateBrowserHistory(delta: number): void {
    const nextIndex = Math.min(
      Math.max(this.browser.historyIndex + delta, 0),
      this.browser.history.length - 1,
    );
    const nextUrl = this.browser.history[nextIndex];

    this.browser = {
      ...this.browser,
      historyIndex: nextIndex,
      currentUrl: nextUrl,
      currentInput: nextUrl,
    };
  }

  private normalizeUrl(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'https://metroui.org.ua';
    }

    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    return `https://${trimmed}`;
  }
}
