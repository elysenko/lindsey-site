import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InsightsAdminService } from '../../services/insights-admin.service';
import { ContentService } from '../../services/content.service';
import {
  AdminInsightUpsertRequest,
  InsightStatusEnum,
  TeamMemberSummaryDto,
} from '../../services/api-types';
import { ApiError } from '../../services/http-error';

@Component({
  selector: 'app-admin-insight-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  template: `
    <a routerLink="/admin/insights" class="back-link">← Back to Insights</a>

    <header class="page-head">
      <div>
        <span class="eyebrow">Admin · Content</span>
        <h1>{{ isNew ? 'New Insights post' : 'Edit ' + model.title }}</h1>
        <p class="muted">{{ wordCount() }} words · Minimum to publish: 1500</p>
      </div>
      <div class="head-actions">
        <button class="btn btn-ghost" (click)="save('DRAFT')" [disabled]="saving()">Save draft</button>
        <button class="btn btn-dark" (click)="save('PUBLISHED')" [disabled]="saving() || wordCount() < 1500">Publish</button>
      </div>
    </header>

    <div class="editor-grid">
      <div class="editor-main card">
        <div class="field">
          <label>Title</label>
          <input type="text" [(ngModel)]="model.title" />
        </div>
        <div class="grid grid-2">
          <div class="field">
            <label>Slug</label>
            <input type="text" [(ngModel)]="model.slug" />
          </div>
          <div class="field">
            <label>Hero image URL</label>
            <input type="url" [(ngModel)]="model.heroImageUrl" placeholder="https://…" />
          </div>
        </div>
        <div class="field">
          <label>Excerpt</label>
          <textarea rows="2" [(ngModel)]="model.excerpt"></textarea>
        </div>
        <div class="field">
          <label>Body</label>
          <div class="rt-toolbar">
            <span class="rt-spacer"></span>
            <span class="rt-count" [class.warn-text]="wordCount() < 1500">
              {{ wordCount() }} / 1500 words
            </span>
          </div>
          <textarea rows="20" [(ngModel)]="model.body" class="rt-body"></textarea>
        </div>
      </div>

      <aside class="editor-side">
        <section class="card">
          <h3>Publishing</h3>
          <div class="field">
            <label>Status</label>
            <div class="status-row">
              <span class="badge" [class.success]="model.status === 'PUBLISHED'" [class.warn]="model.status === 'DRAFT'">
                {{ model.status === 'PUBLISHED' ? 'Published' : 'Draft' }}
              </span>
            </div>
          </div>
          <div class="field">
            <label>Author</label>
            <select [(ngModel)]="model.authorTeamMemberId">
              <option value="">Select author…</option>
              @for (m of team(); track m.id) {
              <option [value]="m.id">{{ m.fullName }}</option>
              }
            </select>
          </div>
          <div class="field">
            <label>Publication date</label>
            <input type="date" [(ngModel)]="publishedAtDate" />
          </div>
        </section>

        <section class="card">
          <h3>SEO preview</h3>
          <div class="seo-preview">
            <p class="seo-url">lebarregroup.com › insights › {{ model.slug }}</p>
            <p class="seo-title">{{ model.title }}</p>
            <p class="seo-desc">{{ model.excerpt }}</p>
          </div>
          <p class="muted small mt-4">
            Last saved: {{ lastSavedAt() ? (lastSavedAt() | date:'MMM d, y · h:mm a') : '—' }}
          </p>
        </section>

        @if (saveMessage()) {
        <div class="save-toast">{{ saveMessage() }}</div>
        }
        @if (saveError()) {
        <div class="error-banner">{{ saveError() }}</div>
        }
      </aside>
    </div>
  `,
  styles: [
    `
      .back-link { display: inline-block; margin-bottom: 12px; color: var(--gold-dark); font-weight: 600; font-size: 0.9rem; }
      .page-head { display: flex; justify-content: space-between; align-items: end; gap: 16px; margin-bottom: var(--s-5); flex-wrap: wrap; }
      .page-head h1 { margin: 4px 0; }
      .head-actions { display: flex; gap: 8px; }

      .editor-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 24px; align-items: start; }
      .editor-main { padding: var(--s-5); }
      .editor-side { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 80px; }

      .rt-toolbar {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px;
        background: var(--bone-2);
        border: 1px solid var(--line);
        border-bottom: 0;
        border-radius: var(--radius-md) var(--radius-md) 0 0;
      }
      .rt-spacer { flex: 1; }
      .rt-count { font-size: 0.82rem; color: var(--muted); font-weight: 600; }
      .warn-text { color: var(--error); }
      .rt-body { border-radius: 0 0 var(--radius-md) var(--radius-md); font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.05rem; line-height: 1.7; }

      .seo-preview {
        background: var(--bone-2);
        padding: 12px;
        border-radius: var(--radius-md);
      }
      .seo-url { font-size: 0.78rem; color: var(--muted); margin: 0; }
      .seo-title { font-family: var(--font-serif); color: #1a0dab; font-size: 1.1rem; margin: 4px 0; }
      .seo-desc { color: var(--ink); font-size: 0.85rem; margin: 0; }

      .save-toast {
        background: rgba(79, 123, 63, 0.12);
        color: var(--success);
        padding: 12px 14px;
        border-radius: var(--radius-md);
        font-size: 0.9rem;
        font-weight: 600;
      }
      .error-banner {
        background: rgba(178, 58, 58, 0.1);
        color: var(--error);
        padding: 12px 14px;
        border-radius: var(--radius-md);
        font-size: 0.9rem;
      }
      .status-row { display: flex; gap: 8px; }
      .mt-4 { margin-top: var(--s-4); }

      @media (max-width: 980px) {
        .editor-grid { grid-template-columns: 1fr; }
        .editor-side { position: static; }
      }
    `,
  ],
})
export class AdminInsightEditorComponent implements OnInit {
  isNew = false;
  saveMessage = signal<string | null>(null);
  saveError = signal<string | null>(null);
  saving = signal(false);
  lastSavedAt = signal<Date | null>(null);
  team = signal<TeamMemberSummaryDto[]>([]);

  /** When editing, this holds the post id so PATCH targets the right row. */
  private postId: string | null = null;
  publishedAtDate = new Date().toISOString().split('T')[0];

  model: {
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    status: InsightStatusEnum;
    authorTeamMemberId: string;
    heroImageUrl: string;
  } = {
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    status: 'DRAFT',
    authorTeamMemberId: '',
    heroImageUrl: '',
  };

  wordCount = computed(() => {
    const text = (this.model.body || '').replace(/<[^>]*>/g, ' ');
    return text.trim().split(/\s+/).filter(Boolean).length;
  });

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly insightsApi = inject(InsightsAdminService);
  private readonly content = inject(ContentService);

  ngOnInit(): void {
    // Load the team list for the author dropdown. Failures are non-fatal —
    // the dropdown will just be empty until reload.
    this.content.listTeam().subscribe({
      next: (members) => this.team.set(members),
      error: () => this.team.set([]),
    });

    const segs = this.route.snapshot.url.map((s) => s.path);
    const slug = this.route.snapshot.paramMap.get('slug');
    if (segs.includes('new') || !slug) {
      this.isNew = true;
      this.model.title = '';
      this.model.slug = '';
    } else {
      this.loadExisting(slug);
    }
  }

  private loadExisting(slug: string): void {
    this.insightsApi.getBySlug(slug).subscribe({
      next: (res) => {
        const post = res.post;
        this.postId = post.id;
        this.model = {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          body: post.body,
          status: post.status,
          authorTeamMemberId: post.author?.id ?? '',
          heroImageUrl: post.heroImageUrl ?? '',
        };
        this.publishedAtDate = post.publishedAt
          ? new Date(post.publishedAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        this.lastSavedAt.set(post.lastUpdatedAt ? new Date(post.lastUpdatedAt) : null);
      },
      error: (err: ApiError) => {
        this.saveError.set(err.message || 'Could not load post.');
      },
    });
  }

  save(targetStatus: InsightStatusEnum): void {
    if (this.saving()) return;
    if (targetStatus === 'PUBLISHED' && this.wordCount() < 1500) {
      this.saveError.set('Cannot publish — minimum 1500 words required.');
      return;
    }
    if (!this.model.title.trim() || !this.model.slug.trim() || !this.model.excerpt.trim() || !this.model.body.trim()) {
      this.saveError.set('Please fill in title, slug, excerpt, and body before saving.');
      return;
    }
    if (!this.model.authorTeamMemberId) {
      this.saveError.set('Please choose an author.');
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);
    this.saveMessage.set(null);

    const payload: AdminInsightUpsertRequest = {
      title: this.model.title.trim(),
      slug: this.model.slug.trim(),
      excerpt: this.model.excerpt.trim(),
      body: this.model.body,
      status: targetStatus,
      authorTeamMemberId: this.model.authorTeamMemberId,
      heroImageUrl: this.model.heroImageUrl.trim() || undefined,
      publishedAt: this.publishedAtDate
        ? new Date(this.publishedAtDate).toISOString()
        : undefined,
    };

    const obs = this.isNew || !this.postId
      ? this.insightsApi.create(payload)
      : this.insightsApi.update(this.postId, payload);

    obs.subscribe({
      next: (post) => {
        this.saving.set(false);
        this.model.status = post.status;
        this.postId = post.id;
        this.lastSavedAt.set(new Date(post.lastUpdatedAt ?? Date.now()));
        this.saveMessage.set(
          targetStatus === 'PUBLISHED'
            ? 'Saved & published. Sitemap updated.'
            : 'Draft saved.',
        );
        if (this.isNew) {
          this.isNew = false;
          // Move into edit mode at the canonical URL so refreshing keeps state.
          this.router.navigate(['/admin/insights', post.slug, 'edit']);
        }
        setTimeout(() => this.saveMessage.set(null), 4000);
      },
      error: (err: ApiError) => {
        this.saving.set(false);
        this.saveError.set(err.message || 'Could not save post.');
      },
    });
  }
}
