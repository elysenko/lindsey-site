import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../services/content.service';
import { ServiceDto } from '../services/api-types';
import { ApiError } from '../services/http-error';
import { StructuredDataService } from '../services/structured-data.service';
import { JsonLdService } from '../services/json-ld.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-head section-bone">
      <div class="container">
        <nav class="crumbs"><a routerLink="/">Home</a> / <span>Services</span></nav>
        <span class="eyebrow">Services</span>
        <h1>Four practices, one operating rhythm.</h1>
        <p class="lead muted">
          Senior counsel from research to rehearsal to performance. Engagements run
          single-practice or stack across — most clients begin with one and add a
          second within twelve months.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        @if (loading()) {
        <p class="muted">Loading services…</p>
        } @else if (error()) {
        <div class="error-state">
          <p>{{ error() }}</p>
          <button class="btn btn-outline" (click)="reload()">Try again</button>
        </div>
        } @else {
        <div class="svc-list">
          @for (svc of services(); track svc.slug; let i = $index; let last = $last) {
          <article class="svc-row">
            <div class="svc-num">0{{ i + 1 }}</div>
            <div class="svc-body">
              <h2>{{ svc.name }}</h2>
              <p>{{ svc.shortDescription }}</p>
              @if (svc.keyOutcomes?.length) {
              <h4 class="outcome-title">Key outcomes</h4>
              <ul class="outcomes">
                @for (o of svc.keyOutcomes; track o) { <li>{{ o }}</li> }
              </ul>
              }
              <a [routerLink]="['/services', svc.slug]" class="btn btn-outline">Service detail &amp; FAQ →</a>
            </div>
          </article>
          @if (!last) { <hr class="divider" /> }
          }
        </div>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .page-head { padding: 56px 0 40px; border-bottom: 1px solid var(--line); }
      .crumbs { font-size: 0.85rem; color: var(--muted); margin-bottom: 16px; }
      .crumbs a { color: var(--muted); }
      .lead { max-width: 64ch; }

      .svc-list { display: flex; flex-direction: column; gap: var(--s-7); }
      .svc-row {
        display: grid;
        grid-template-columns: 80px 1fr;
        gap: 32px;
        align-items: start;
      }
      .svc-num {
        font-family: var(--font-serif);
        font-size: 2.4rem;
        color: var(--gold);
        line-height: 1;
        font-weight: 600;
      }
      .svc-body h2 { margin-top: 0; }
      .outcome-title {
        font-family: var(--font-sans);
        font-size: 0.78rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: var(--gold-dark);
        margin: 24px 0 12px;
      }
      .outcomes {
        list-style: none;
        padding: 0;
        margin: 0 0 var(--s-5);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .outcomes li {
        position: relative;
        padding-left: 24px;
        color: var(--ink);
        font-size: 1rem;
      }
      .outcomes li::before {
        content: '';
        position: absolute;
        top: 9px;
        left: 0;
        width: 14px;
        height: 2px;
        background: var(--gold);
      }
      .error-state { padding: var(--s-5); text-align: center; color: var(--error); }
      @media (max-width: 768px) {
        .svc-row { grid-template-columns: 1fr; gap: 12px; }
        .svc-num { font-size: 1.6rem; }
      }
    `,
  ],
})
export class ServicesComponent implements OnInit {
  services = signal<ServiceDto[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  private readonly content = inject(ContentService);
  private readonly structured = inject(StructuredDataService);
  private readonly jsonLd = inject(JsonLdService);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.content.listServices().subscribe({
      next: (res) => {
        this.services.set(res.items);
        // Backend ships an OfferCatalog blob alongside the services. We
        // also inject Organization (always-on) + BreadcrumbList for the page.
        this.structured.set([
          this.jsonLd.organization(),
          this.jsonLd.breadcrumbs([
            { name: 'Home', url: '/' },
            { name: 'Services', url: '/services' },
          ]),
          res.jsonLd,
        ]);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.loading.set(false);
        this.error.set(err.message || 'Could not load services.');
      },
    });
  }
}
