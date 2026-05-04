import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentService } from '../services/content.service';
import { ServiceDto } from '../services/api-types';
import { ApiError } from '../services/http-error';
import { StructuredDataService } from '../services/structured-data.service';
import { JsonLdService } from '../services/json-ld.service';
import { FaqAccordionComponent } from '../components/faq-accordion.component';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FaqAccordionComponent],
  template: `
    @if (loading()) {
    <section class="section text-center"><div class="container"><p class="muted">Loading service…</p></div></section>
    } @else if (notFound()) {
    <section class="section text-center">
      <div class="container">
        <h1>Service not found.</h1>
        <p>The page you requested no longer exists.</p>
        <a routerLink="/services" class="btn btn-outline">Back to Services</a>
      </div>
    </section>
    } @else if (svc()) {
    @let s = svc()!;
    <section class="page-head section-bone">
      <div class="container">
        <nav class="crumbs">
          <a routerLink="/">Home</a> /
          <a routerLink="/services">Services</a> /
          <span>{{ s.name }}</span>
        </nav>
        <span class="eyebrow">Practice</span>
        <h1>{{ s.name }}</h1>
        <p class="lead muted">{{ s.shortDescription }}</p>
      </div>
    </section>

    <section class="section">
      <div class="container detail-grid">
        <div class="long-copy">
          <p class="lede">{{ s.longDescription }}</p>

          @if (s.keyOutcomes?.length) {
          <h2 class="mt-6">Key outcomes for our clients</h2>
          <ul class="outcomes">
            @for (o of s.keyOutcomes; track o) { <li>{{ o }}</li> }
          </ul>
          }

          @if (s.faqs?.length) {
          <h2 class="mt-6">Frequently asked</h2>
          <app-faq-accordion [items]="faqItems()"></app-faq-accordion>
          }
        </div>

        <aside class="aside">
          <div class="aside-card">
            <h3>Engage The LeBarre Group</h3>
            <p class="muted">
              A 30-minute consultation, under NDA, with a senior partner.
              No commitment.
            </p>
            <a routerLink="/consult" class="btn btn-dark btn-block">Request a Consultation</a>
            <a href="tel:+12025550140" class="btn btn-outline btn-block mt-4">+1 (202) 555-0140</a>
            <hr class="divider" />
            <p class="small muted">
              <strong>Active crisis?</strong> Call the senior-partner line. We answer within 30 minutes.
            </p>
          </div>
        </aside>
      </div>
    </section>
    }
  `,
  styles: [
    `
      .page-head { padding: 48px 0 32px; border-bottom: 1px solid var(--line); }
      .crumbs { font-size: 0.85rem; color: var(--muted); margin-bottom: 12px; }
      .crumbs a { color: var(--muted); }
      .lead { max-width: 64ch; font-size: 1.2rem; }

      .detail-grid {
        display: grid;
        grid-template-columns: 1.6fr 1fr;
        gap: 64px;
        align-items: start;
      }
      .long-copy .lede {
        font-family: var(--font-serif);
        font-size: 1.35rem;
        line-height: 1.5;
        color: var(--ink);
      }
      .mt-6 { margin-top: var(--s-7); }
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

      .aside { position: sticky; top: 96px; display: flex; flex-direction: column; gap: 24px; }
      .aside-card {
        background: #fff;
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        padding: var(--s-6);
        box-shadow: var(--shadow-sm);
      }

      @media (max-width: 980px) {
        .detail-grid { grid-template-columns: 1fr; gap: 32px; }
        .aside { position: static; }
      }
    `,
  ],
})
export class ServiceDetailComponent implements OnInit {
  svc = signal<ServiceDto | null>(null);
  loading = signal(true);
  notFound = signal(false);

  private readonly route = inject(ActivatedRoute);
  private readonly content = inject(ContentService);
  private readonly structured = inject(StructuredDataService);
  private readonly jsonLd = inject(JsonLdService);

  ngOnInit(): void {
    this.route.paramMap.subscribe((p) => {
      const slug = p.get('slug') ?? '';
      this.load(slug);
    });
  }

  private load(slug: string): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.content.getService(slug).subscribe({
      next: (res) => {
        this.svc.set(res.service);
        // The backend returns Service + FAQPage + BreadcrumbList JSON-LD
        // ready for injection — re-publish them via JsonLdService along
        // with the always-on Organization blob.
        this.structured.set([
          this.jsonLd.organization(),
          res.jsonLd?.service,
          res.jsonLd?.faq,
          res.jsonLd?.breadcrumbs,
        ]);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.loading.set(false);
        if (err.kind === 'not-found') this.notFound.set(true);
        else this.notFound.set(true); // also fall back to not-found UI
      },
    });
  }

  /** Adapter for the existing FaqAccordionComponent which expects `{q,a}`. */
  faqItems(): { q: string; a: string }[] {
    const s = this.svc();
    if (!s?.faqs) return [];
    return s.faqs.map((f) => ({ q: f.question, a: f.answer }));
  }
}
