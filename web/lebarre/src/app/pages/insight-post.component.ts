import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ContentService } from '../services/content.service';
import { InsightDetailDto } from '../services/api-types';
import { ApiError } from '../services/http-error';
import { StructuredDataService } from '../services/structured-data.service';
import { JsonLdService } from '../services/json-ld.service';

@Component({
  selector: 'app-insight-post',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    @if (loading()) {
    <section class="section text-center"><div class="container"><p class="muted">Loading article…</p></div></section>
    } @else if (notFound()) {
    <section class="section text-center">
      <div class="container">
        <h1>Article not found.</h1>
        <a routerLink="/insights" class="btn btn-outline">Back to Insights</a>
      </div>
    </section>
    } @else if (post()) {
    @let p = post()!;
    <article class="post">
      <header class="post-head">
        <div class="container">
          <nav class="crumbs">
            <a routerLink="/">Home</a> /
            <a routerLink="/insights">Insights</a> /
            <span>{{ p.title }}</span>
          </nav>
          <h1>{{ p.title }}</h1>
          <p class="lead muted">{{ p.excerpt }}</p>
          <div class="byline">
            <a [routerLink]="['/team', p.author?.slug]" class="byline-author">
              <span class="avatar-mini">{{ initialsFor(p.author?.fullName) }}</span>
              <span class="byline-text">
                <span class="name">By {{ p.author?.honorificPrefix }} {{ p.author?.fullName }}<span *ngIf="p.author?.credentials?.length">, {{ p.author?.credentials?.join(', ') }}</span></span>
                <span class="role">{{ p.author?.title }}, The LeBarre Group</span>
              </span>
            </a>
            <span class="meta">
              <span>Published {{ p.publishedAt | date:'longDate' }}</span>
              @if (p.publishedAt && p.lastUpdatedAt && p.publishedAt !== p.lastUpdatedAt) {
              <span>Updated {{ p.lastUpdatedAt | date:'longDate' }}</span>
              }
            </span>
          </div>
        </div>
      </header>

      <div class="container article-body">
        <div class="hero-art" [style.background-image]="p.heroImageUrl ? 'url(' + p.heroImageUrl + ')' : null">
          @if (!p.heroImageUrl) {
          <span class="hero-mark">LB</span>
          }
        </div>
        <div class="prose" [innerHTML]="bodyHtml()"></div>

        <hr class="divider" />

        <div class="post-cta card">
          <div>
            <span class="eyebrow">Continue the conversation</span>
            <h3>If this is the kind of thinking you want at your table —</h3>
            <p class="muted mb-0">A 30-minute consultation, under NDA, with a senior partner.</p>
          </div>
          <a routerLink="/consult" class="btn btn-dark">Request a Consultation</a>
        </div>
      </div>
    </article>
    }
  `,
  styles: [
    `
      .post-head { background: var(--bone-2); padding: 56px 0 40px; border-bottom: 1px solid var(--line); }
      .crumbs { font-size: 0.85rem; color: var(--muted); margin-bottom: 12px; }
      .crumbs a { color: var(--muted); }
      .post-head h1 { max-width: 22ch; }
      .lead { max-width: 60ch; font-size: 1.18rem; }

      .byline {
        display: flex;
        flex-wrap: wrap;
        gap: 16px 32px;
        align-items: center;
        margin-top: var(--s-5);
        padding-top: var(--s-5);
        border-top: 1px solid var(--line);
      }
      .byline-author {
        display: flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;
        color: inherit;
      }
      .avatar-mini {
        width: 48px; height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--espresso), var(--espresso-3));
        color: var(--gold-light);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-serif);
        font-size: 1.05rem;
        font-weight: 600;
      }
      .byline-text { display: flex; flex-direction: column; line-height: 1.25; }
      .byline-text .name { font-weight: 600; color: var(--ink); font-size: 0.95rem; }
      .byline-text .role { color: var(--muted); font-size: 0.85rem; }
      .meta {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        font-size: 0.85rem;
        color: var(--muted);
      }

      .article-body { max-width: 760px; padding-top: var(--s-7); padding-bottom: var(--s-9); }
      .hero-art {
        background: linear-gradient(135deg, var(--espresso), var(--espresso-2));
        background-size: cover;
        background-position: center;
        aspect-ratio: 16 / 7;
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--gold-light);
        position: relative;
        margin-bottom: var(--s-6);
      }
      .hero-mark {
        font-family: var(--font-serif);
        font-size: 5rem;
        font-weight: 600;
        letter-spacing: 0.2em;
      }

      .prose h2 {
        font-size: 1.7rem;
        margin: var(--s-7) 0 var(--s-3);
      }
      .prose p {
        font-size: 1.08rem;
        line-height: 1.75;
        color: var(--ink);
        margin: 0 0 var(--s-4);
      }

      .post-cta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        padding: var(--s-6);
        background: var(--bone-2);
        border: 1px solid var(--line);
        flex-wrap: wrap;
      }
      .post-cta .eyebrow { display: block; }
      .post-cta h3 { margin: 4px 0 6px; }
    `,
  ],
})
export class InsightPostComponent implements OnInit {
  post = signal<InsightDetailDto | null>(null);
  bodyHtml = signal<SafeHtml>('');
  loading = signal(true);
  notFound = signal(false);

  private readonly route = inject(ActivatedRoute);
  private readonly content = inject(ContentService);
  private readonly sanitizer = inject(DomSanitizer);
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
    this.content.getInsight(slug).subscribe({
      next: (res) => {
        this.post.set(res.post);
        // The backend already sanitises body content via sanitize-html; we
        // still bypassSecurityTrustHtml so Angular renders the markup.
        this.bodyHtml.set(this.sanitizer.bypassSecurityTrustHtml(res.post.body));
        this.structured.set([
          this.jsonLd.organization(),
          res.jsonLd?.article,
          res.jsonLd?.breadcrumbs,
        ]);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.loading.set(false);
        if (err.kind === 'not-found') this.notFound.set(true);
        else this.notFound.set(true);
      },
    });
  }

  initialsFor(name: string | undefined): string {
    if (!name) return '··';
    return name
      .split(' ')
      .map((p) => p.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
