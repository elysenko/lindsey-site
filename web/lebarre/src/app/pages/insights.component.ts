import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../services/content.service';
import { InsightsListItemDto } from '../services/api-types';
import { ApiError } from '../services/http-error';
import { StructuredDataService } from '../services/structured-data.service';
import { JsonLdService } from '../services/json-ld.service';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <section class="page-head section-bone">
      <div class="container">
        <nav class="crumbs"><a routerLink="/">Home</a> / <span>Insights</span></nav>
        <span class="eyebrow">Insights</span>
        <h1>Field notes from the work.</h1>
        <p class="lead muted">
          Long-form thinking from the people who do this work for a living.
          New writing every two weeks; archived essays kept current.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        @if (loading()) {
        <p class="muted">Loading articles…</p>
        } @else if (error()) {
        <div class="error-state">
          <p>{{ error() }}</p>
          <button class="btn btn-outline" (click)="reload()">Try again</button>
        </div>
        } @else if (posts().length === 0) {
        <p class="muted">New articles will appear here as they are published.</p>
        } @else {
        <div class="post-grid">
          @for (post of posts(); track post.slug; let i = $index) {
          <article class="post-card" [class.featured]="i === 0">
            <a [routerLink]="['/insights', post.slug]" class="post-link">
              <div class="thumb" [style.background-image]="post.heroImageUrl ? 'url(' + post.heroImageUrl + ')' : null">
                <span class="initials">{{ initialsFor(post.author?.fullName) }}</span>
              </div>
              <div class="post-body">
                <span class="meta">
                  {{ post.publishedAt | date:'longDate' }}
                </span>
                <h2>{{ post.title }}</h2>
                <p class="excerpt">{{ post.excerpt }}</p>
                <span class="byline">By {{ post.author?.fullName || 'LeBarre Team' }}</span>
              </div>
            </a>
          </article>
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
      .error-state { padding: var(--s-5); color: var(--error); text-align: center; }

      .post-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 32px; }
      .post-card.featured { grid-column: 1 / -1; }
      .post-card.featured .post-link { grid-template-columns: 1.1fr 1fr; }
      .post-card.featured h2 { font-size: clamp(1.6rem, 3vw, 2.2rem); }

      .post-link {
        display: grid;
        grid-template-columns: 1fr;
        background: #fff;
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        overflow: hidden;
        text-decoration: none;
        color: inherit;
        transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
      }
      .post-link:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-color: var(--gold);
      }
      .thumb {
        position: relative;
        background: linear-gradient(135deg, var(--espresso), var(--espresso-3));
        background-size: cover;
        background-position: center;
        aspect-ratio: 16 / 9;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--gold);
      }
      .post-card.featured .thumb { aspect-ratio: auto; min-height: 280px; }
      .thumb .initials {
        font-family: var(--font-serif);
        font-size: 4rem;
        font-weight: 600;
        color: var(--gold-light);
        opacity: 0.9;
      }
      .post-body { padding: var(--s-6); }
      .meta {
        font-size: 0.78rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
        font-weight: 600;
        margin-bottom: 8px;
        display: block;
      }
      .post-body h2 { font-size: 1.4rem; margin-bottom: 12px; }
      .excerpt { color: var(--muted); }
      .byline {
        font-size: 0.85rem;
        color: var(--gold-dark);
        font-weight: 600;
      }

      @media (max-width: 768px) {
        .post-card.featured .post-link { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class InsightsComponent implements OnInit {
  posts = signal<InsightsListItemDto[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  private readonly content = inject(ContentService);
  private readonly structured = inject(StructuredDataService);
  private readonly jsonLd = inject(JsonLdService);

  ngOnInit(): void {
    this.reload();
    this.structured.set([
      this.jsonLd.organization(),
      this.jsonLd.breadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Insights', url: '/insights' },
      ]),
    ]);
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.content.listInsights().subscribe({
      next: (res) => {
        this.posts.set(res.items);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.loading.set(false);
        this.error.set(err.message || 'Could not load articles.');
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
