import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq-accordion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="faq">
      @for (item of items; track $index) {
      <details class="faq-item" [open]="$index === 0">
        <summary class="faq-q">
          <span>{{ item.q }}</span>
          <span class="caret" aria-hidden="true">+</span>
        </summary>
        <div class="faq-a">{{ item.a }}</div>
      </details>
      }
    </div>
  `,
  styles: [
    `
      .faq { display: flex; flex-direction: column; }
      .faq-item {
        border-top: 1px solid var(--line);
      }
      .faq-item:last-child { border-bottom: 1px solid var(--line); }
      .faq-q {
        list-style: none;
        cursor: pointer;
        padding: 20px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        font-family: var(--font-serif);
        font-size: 1.2rem;
        color: var(--espresso);
        min-height: 56px;
      }
      .faq-q::-webkit-details-marker { display: none; }
      .faq-q:active { background: rgba(184, 144, 85, 0.05); }
      .caret {
        font-size: 1.5rem;
        font-weight: 300;
        color: var(--gold);
        transition: transform 0.2s ease;
        flex: 0 0 auto;
      }
      .faq-item[open] .caret { transform: rotate(45deg); }
      .faq-a {
        padding: 0 0 20px;
        color: var(--ink);
        font-size: 1rem;
        line-height: 1.6;
        max-width: 70ch;
      }
      @media (max-width: 768px) {
        .faq-q { font-size: 1.05rem; padding: 16px 0; }
      }
    `,
  ],
})
export class FaqAccordionComponent {
  @Input() items: { q: string; a: string }[] = [];
}
