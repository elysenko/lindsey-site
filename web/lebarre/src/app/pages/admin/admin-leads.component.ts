import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LeadsService } from '../../services/leads.service';
import {
  AdminLeadListItem,
  AdminLeadsListQuery,
  BriefStatusEnum,
  CHALLENGE_CATEGORY_LABELS,
  ChallengeCategoryEnum,
  LeadSort,
  LeadStatusEnum,
} from '../../services/api-types';
import { ApiError } from '../../services/http-error';

@Component({
  selector: 'app-admin-leads',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  template: `
    <div class="page-head">
      <div>
        <span class="eyebrow">Admin</span>
        <h1>Leads</h1>
        <p class="muted">{{ totalLabel() }}</p>
      </div>
    </div>

    <div class="filters card">
      <div class="filter-grid">
        <div class="field">
          <label for="cat">Challenge category</label>
          <select id="cat" [ngModel]="catFilter()" (ngModelChange)="setCatFilter($event)">
            <option value="">All categories</option>
            @for (c of categoryOptions; track c.value) {
            <option [value]="c.value">{{ c.label }}</option>
            }
          </select>
        </div>
        <div class="field">
          <label for="brief">Brief status</label>
          <select id="brief" [ngModel]="briefFilter()" (ngModelChange)="setBriefFilter($event)">
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div class="field">
          <label for="status">Lead status</label>
          <select id="status" [ngModel]="statusFilter()" (ngModelChange)="setStatusFilter($event)">
            <option value="">All</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <div class="field">
          <label for="sort">Sort</label>
          <select id="sort" [ngModel]="sort()" (ngModelChange)="setSort($event)">
            <option value="createdAt:desc">Newest first</option>
            <option value="createdAt:asc">Oldest first</option>
            <option value="organization:asc">Organization (A-Z)</option>
            <option value="organization:desc">Organization (Z-A)</option>
          </select>
        </div>
      </div>
    </div>

    <div class="table-wrap card">
      @if (loading()) {
      <div class="empty"><p class="muted">Loading leads…</p></div>
      } @else if (error()) {
      <div class="empty">
        <p class="error-text">{{ error() }}</p>
        <button class="btn btn-outline" (click)="reload()">Try again</button>
      </div>
      } @else if (rows().length === 0) {
      <div class="empty"><p class="muted">No leads match these filters.</p></div>
      } @else {
      <table class="leads-table">
        <thead>
          <tr>
            <th>Submitted</th>
            <th>Name</th>
            <th>Organization</th>
            <th>Service Interest</th>
            <th>Challenges</th>
            <th>Brief</th>
            <th>Lead Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (lead of rows(); track lead.id) {
          <tr>
            <td>
              <span class="small muted">{{ lead.createdAt | date:'MMM d, y' }}</span><br/>
              <span class="xs muted">{{ lead.createdAt | date:'h:mm a' }}</span>
            </td>
            <td>
              <strong>{{ lead.fullName }}</strong><br />
              <a [href]="'mailto:' + lead.email" class="small muted">{{ lead.email }}</a>
            </td>
            <td>{{ lead.organization }}</td>
            <td>{{ lead.primaryService?.name || '—' }}</td>
            <td>
              <div class="chips">
                @for (c of lead.challengeCategories; track c) {
                <span class="chip">{{ categoryLabel(c) }}</span>
                }
              </div>
            </td>
            <td>
              @if (lead.briefStatus === 'COMPLETED') {
                <span class="badge success">Completed</span>
              } @else {
                <span class="badge warn">Pending</span>
              }
            </td>
            <td>
              <select [ngModel]="lead.leadStatus" (ngModelChange)="updateStatus(lead, $event)" class="status-select" [class]="'status-' + lead.leadStatus.toLowerCase()">
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="CLOSED">Closed</option>
              </select>
            </td>
            <td><a [routerLink]="['/admin/leads', lead.id]" class="link-arrow">Open</a></td>
          </tr>
          }
        </tbody>
      </table>
      }
    </div>

    @if (pagination(); as p) {
      @if (p.totalPages > 1) {
      <div class="pager">
        <button class="btn btn-outline" (click)="setPage(p.page - 1)" [disabled]="p.page <= 1">← Prev</button>
        <span class="muted small">Page {{ p.page }} of {{ p.totalPages }}</span>
        <button class="btn btn-outline" (click)="setPage(p.page + 1)" [disabled]="p.page >= p.totalPages">Next →</button>
      </div>
      }
    }
  `,
  styles: [
    `
      .page-head {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: var(--s-5);
        flex-wrap: wrap;
      }
      .page-head h1 { margin: 4px 0; }

      .filters { padding: var(--s-5); margin-bottom: var(--s-4); }
      .filter-grid {
        display: grid;
        grid-template-columns: 1.4fr 1fr 1fr 1fr;
        gap: 16px;
      }
      .field { margin-bottom: 0; }

      .table-wrap { padding: 0; overflow: hidden; }
      .leads-table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
      .leads-table th, .leads-table td { padding: 14px 16px; text-align: left; vertical-align: middle; }
      .leads-table thead { background: var(--bone-2); }
      .leads-table th {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--muted);
        font-weight: 600;
        white-space: nowrap;
      }
      .leads-table tbody tr { border-top: 1px solid var(--line); }
      .leads-table tbody tr:hover { background: rgba(184, 144, 85, 0.04); }

      .chips { display: flex; flex-wrap: wrap; gap: 4px; }
      .chip {
        background: var(--bone-2);
        color: var(--espresso);
        font-size: 0.72rem;
        padding: 3px 8px;
        border-radius: 4px;
        font-weight: 500;
      }

      .status-select {
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 6px 12px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        min-height: 32px;
      }
      .status-select.status-new { border-color: var(--info); color: var(--info); }
      .status-select.status-contacted { border-color: var(--warn); color: var(--warn); }
      .status-select.status-closed { border-color: var(--muted); color: var(--muted); }

      .empty { padding: 48px; text-align: center; }
      .error-text { color: var(--error); margin-bottom: 12px; }
      .pager { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: var(--s-5); }

      .xs { font-size: 0.78rem; }

      @media (max-width: 980px) {
        .filter-grid { grid-template-columns: 1fr 1fr; }
      }
      @media (max-width: 640px) {
        .filter-grid { grid-template-columns: 1fr; }
        .table-wrap { overflow-x: auto; }
        .leads-table { min-width: 720px; }
      }
    `,
  ],
})
export class AdminLeadsComponent implements OnInit {
  private readonly leadsApi = inject(LeadsService);

  rows = signal<AdminLeadListItem[]>([]);
  pagination = signal<{ page: number; pageSize: number; total: number; totalPages: number } | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  page = signal(1);
  catFilter = signal<ChallengeCategoryEnum | ''>('');
  briefFilter = signal<BriefStatusEnum | ''>('');
  statusFilter = signal<LeadStatusEnum | ''>('');
  sort = signal<LeadSort>('createdAt:desc');

  /** Backend ChallengeCategory values mapped to user-readable labels. */
  categoryOptions: { value: ChallengeCategoryEnum; label: string }[] = (
    Object.keys(CHALLENGE_CATEGORY_LABELS) as ChallengeCategoryEnum[]
  ).map((value) => ({ value, label: CHALLENGE_CATEGORY_LABELS[value] }));

  ngOnInit(): void {
    this.reload();
  }

  totalLabel(): string {
    const p = this.pagination();
    if (!p) return '—';
    return `${this.rows().length} of ${p.total} submission${p.total === 1 ? '' : 's'}`;
  }

  categoryLabel(c: ChallengeCategoryEnum): string {
    return CHALLENGE_CATEGORY_LABELS[c] || c;
  }

  setCatFilter(v: ChallengeCategoryEnum | ''): void {
    this.catFilter.set(v);
    this.page.set(1);
    this.reload();
  }
  setBriefFilter(v: BriefStatusEnum | ''): void {
    this.briefFilter.set(v);
    this.page.set(1);
    this.reload();
  }
  setStatusFilter(v: LeadStatusEnum | ''): void {
    this.statusFilter.set(v);
    this.page.set(1);
    this.reload();
  }
  setSort(v: LeadSort): void {
    this.sort.set(v);
    this.reload();
  }
  setPage(p: number): void {
    if (p < 1) return;
    this.page.set(p);
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);

    const query: AdminLeadsListQuery = {
      page: this.page(),
      sort: this.sort(),
    };
    if (this.catFilter()) query.challengeCategory = this.catFilter() as ChallengeCategoryEnum;
    if (this.briefFilter()) query.briefStatus = this.briefFilter() as BriefStatusEnum;
    if (this.statusFilter()) query.leadStatus = this.statusFilter() as LeadStatusEnum;

    this.leadsApi.list(query).subscribe({
      next: (res) => {
        this.rows.set(res.items);
        this.pagination.set(res.pagination);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.loading.set(false);
        // The interceptor handles 401 → redirect; here we only need to show
        // a recoverable error for transient issues.
        this.error.set(err.message || 'Could not load leads.');
      },
    });
  }

  updateStatus(lead: AdminLeadListItem, status: LeadStatusEnum): void {
    // Optimistic UI: flip the row immediately, roll back on failure.
    const prev = lead.leadStatus;
    this.rows.update((arr) =>
      arr.map((l) => (l.id === lead.id ? { ...l, leadStatus: status } : l)),
    );
    this.leadsApi.updateStatus(lead.id, status).subscribe({
      error: (err: ApiError) => {
        this.rows.update((arr) =>
          arr.map((l) => (l.id === lead.id ? { ...l, leadStatus: prev } : l)),
        );
        this.error.set(err.message || 'Could not update lead status.');
      },
    });
  }
}
