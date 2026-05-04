import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InsightsAdminService } from '../../services/insights-admin.service';
import { InsightsListItemDto } from '../../services/api-types';
import { ApiError } from '../../services/http-error';

@Component({
  selector: 'app-admin-insights',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <div class="page-head">
      <div>
        <span class="eyebrow">Admin · Content</span>
        <h1>Insights</h1>
        <p class="muted">{{ posts().length }} posts</p>
      </div>
      <div class="head-actions">
        <a routerLink="/admin/insights/new" class="btn btn-dark">+ New Post</a>
      </div>
    </div>

    @if (loading()) {
    <div class="card empty"><p class="muted">Loading posts…</p></div>
    } @else if (error()) {
    <div class="card empty">
      <p class="error-text">{{ error() }}</p>
      <button class="btn btn-outline" (click)="reload()">Try again</button>
    </div>
    } @else if (posts().length === 0) {
    <div class="card empty"><p class="muted">No posts published yet. Create one to get started.</p></div>
    } @else {
    <div class="card">
      <table class="posts-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Status</th>
            <th>Published</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (p of posts(); track p.slug) {
          <tr>
            <td>
              <strong>{{ p.title }}</strong><br />
              <span class="muted small">/insights/{{ p.slug }}</span>
            </td>
            <td>{{ p.author?.fullName || 'LeBarre Team' }}</td>
            <td><span class="badge success">Published</span></td>
            <td><span class="small">{{ p.publishedAt | date:'MMM d, y' }}</span></td>
            <td><span class="small">{{ p.lastUpdatedAt | date:'MMM d, y' }}</span></td>
            <td><a [routerLink]="['/admin/insights', p.slug, 'edit']" class="link-arrow">Edit</a></td>
          </tr>
          }
        </tbody>
      </table>
    </div>
    }
  `,
  styles: [
    `
      .page-head { display: flex; justify-content: space-between; align-items: end; gap: 16px; margin-bottom: var(--s-5); flex-wrap: wrap; }
      .page-head h1 { margin: 4px 0; }

      .card { padding: 0; overflow: hidden; }
      .empty { padding: 48px; text-align: center; }
      .error-text { color: var(--error); margin-bottom: 12px; }

      .posts-table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
      .posts-table th, .posts-table td { padding: 14px 16px; text-align: left; }
      .posts-table thead { background: var(--bone-2); }
      .posts-table th {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--muted);
        font-weight: 600;
      }
      .posts-table tbody tr { border-top: 1px solid var(--line); }
      .posts-table tbody tr:hover { background: rgba(184, 144, 85, 0.04); }

      @media (max-width: 768px) {
        .card { overflow-x: auto; }
        .posts-table { min-width: 720px; }
      }
    `,
  ],
})
export class AdminInsightsComponent implements OnInit {
  posts = signal<InsightsListItemDto[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  private readonly insightsApi = inject(InsightsAdminService);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.insightsApi.list().subscribe({
      next: (res) => {
        this.posts.set(res.items);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.loading.set(false);
        this.error.set(err.message || 'Could not load posts.');
      },
    });
  }
}
