import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-website',
  standalone: true,
  imports: [CommonModule],
  template: `
    <iframe
      src="https://opshan.github.io/home"
      title="Opshan Website"
      loading="eager"
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
  `,
  styles: [
    `:host { display: block; width: 100%; height: 100%; }`,
    `iframe { width: 100%; height: 100%; border: 0;  }`,
  ],
})
export class WebsiteComponent {}
