import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../services/content.service';
import { ApiError } from '../services/http-error';
import { StructuredDataService } from '../services/structured-data.service';
import { JsonLdService } from '../services/json-ld.service';
import { FaqAccordionComponent } from '../components/faq-accordion.component';

interface FaqGroup {
  category: string;
  items: { q: string; a: string }[];
}

const CATEGORY_LABELS: Record<string, string> = {
  CRISIS: 'Crisis Communications',
  REPUTATION: 'Reputation Management',
  AI: 'AI Services',
  WORKING_WITH: 'Working with LeBarre Group',
};
const CATEGORY_ORDER = ['CRISIS', 'REPUTATION', 'AI', 'WORKING_WITH'];

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterLink, FaqAccordionComponent],
  template: `
    <section class="page-head section-bone">
      <div class="container">
        <nav class="crumbs"><a routerLink="/">Home</a> / <span>FAQ</span></nav>
        <span class="eyebrow">Frequently asked</span>
        <h1>Questions, answered.</h1>
        <p class="lead muted">
          The questions our prospective clients ask in the first call.
          If yours is not here, the consultation is free.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container faq-grid">
        @if (loading()) {
        <p class="muted">Loading FAQs…</p>
        } @else if (error()) {
        <p class="error-text">{{ error() }}</p>
        } @else {
        <aside class="toc">
          <h4>Categories</h4>
          <ul>
            @for (g of groups(); track g.category) {
            <li><a [href]="'#' + slugify(g.category)">{{ g.category }}</a></li>
            }
          </ul>
          <a routerLink="/consult" class="btn btn-dark btn-block mt-4">Request a Consultation</a>
        </aside>

        <div class="faq-body">
          @for (g of groups(); track g.category) {
          <section class="faq-group" [id]="slugify(g.category)">
            <h2>{{ g.category }}</h2>
            <app-faq-accordion [items]="g.items"></app-faq-accordion>
          </section>
          }
        </div>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .page-head { padding: 56px 0 40px; border-bottom: 1px solid var(--line); }
      .crumbs { font-size: 0.85rem; color: var(--muted); margin-bottom: 12px; }
      .crumbs a { color: var(--muted); }
      .error-text { color: var(--error); }

      .faq-grid { display: grid; grid-template-columns: 240px 1fr; gap: 64px; align-items: start; }
      .toc { position: sticky; top: 96px; }
      .toc h4 {
        font-family: var(--font-sans);
        font-size: 0.78rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: var(--gold-dark);
        margin: 0 0 12px;
      }
      .toc ul { list-style: none; padding: 0; margin: 0 0 var(--s-5); display: flex; flex-direction: column; gap: 8px; }
      .toc a { color: var(--ink); font-size: 0.95rem; }

      .faq-group { margin-bottom: var(--s-7); }
      .faq-group h2 { font-size: 1.6rem; padding-bottom: 8px; border-bottom: 2px solid var(--gold); display: inline-block; }

      @media (max-width: 900px) {
        .faq-grid { grid-template-columns: 1fr; }
        .toc { position: static; }
      }
    `,
  ],
})
export class FaqComponent implements OnInit {
  groups = signal<FaqGroup[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  private readonly content = inject(ContentService);
  private readonly structured = inject(StructuredDataService);
  private readonly jsonLd = inject(JsonLdService);

  ngOnInit(): void {
    this.content.listFaq().subscribe({
      next: (res) => {
        // Backend returns groups keyed by SiteFaqCategory enum (CRISIS,
        // REPUTATION, AI, WORKING_WITH). Map to display labels and force a
        // stable ordering matching the spec.
        const out: FaqGroup[] = [];
        for (const key of CATEGORY_ORDER) {
          const items = res.groups[key];
          if (items?.length) {
            out.push({
              category: CATEGORY_LABELS[key] ?? key,
              items: items.map((it) => ({ q: it.question, a: it.answer })),
            });
          }
        }
        // Append anything unexpected at the end so unknown categories don't
        // disappear silently.
        for (const [key, items] of Object.entries(res.groups)) {
          if (!CATEGORY_ORDER.includes(key) && items?.length) {
            out.push({
              category: CATEGORY_LABELS[key] ?? key,
              items: items.map((it) => ({ q: it.question, a: it.answer })),
            });
          }
        }
        this.groups.set(out);
        this.loading.set(false);

        this.structured.set([
          this.jsonLd.organization(),
          res.jsonLd,
          this.jsonLd.breadcrumbs([
            { name: 'Home', url: '/' },
            { name: 'FAQ', url: '/faq' },
          ]),
        ]);
      },
      error: (err: ApiError) => {
        this.loading.set(false);
        this.error.set(err.message || 'Could not load FAQs.');
      },
    });
  }

  slugify(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
}
