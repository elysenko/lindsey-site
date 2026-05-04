import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LeadsService } from '../../services/leads.service';
import {
  AdminBrandBriefDto,
  AdminLeadDetailDto,
  AdminLeadNoteDto,
  BriefFieldKey,
  CHALLENGE_CATEGORY_LABELS,
  ChallengeCategoryEnum,
  LeadStatusEnum,
} from '../../services/api-types';
import { ApiError } from '../../services/http-error';

interface BriefRow {
  label: string;
  key: BriefFieldKey;
  value: string;
}

@Component({
  selector: 'app-admin-lead-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  template: `
    <a routerLink="/admin/leads" class="back-link">← Back to Leads</a>

    @if (loading()) {
    <div class="card center"><p class="muted">Loading lead…</p></div>
    } @else if (loadError()) {
    <div class="card center">
      <p class="error-text">{{ loadError() }}</p>
      <button class="btn btn-outline" (click)="reload()">Try again</button>
    </div>
    } @else if (lead()) {
    @let l = lead()!;
    <header class="lead-head">
      <div>
        <span class="eyebrow">Lead · {{ l.id }}</span>
        <h1>{{ l.fullName }}</h1>
        <p class="muted">{{ l.organization }} · Submitted {{ l.createdAt | date:'MMM d, y · h:mm a' }}</p>
      </div>
      <div class="head-actions">
        <select [ngModel]="l.leadStatus" (ngModelChange)="setStatus($event)" class="status-select" [class]="'status-' + l.leadStatus.toLowerCase()">
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>
    </header>

    @if (saveError()) {
    <div class="error-banner" role="alert">{{ saveError() }}</div>
    }

    <div class="detail-grid">
      <div class="col-main">
        <section class="card">
          <h3>Contact</h3>
          <dl class="kv">
            <dt>Email</dt><dd><a [href]="'mailto:' + l.email">{{ l.email }}</a></dd>
            <dt>Phone</dt><dd>
              @if (l.phone) {
              <a [href]="'tel:' + l.phone">{{ l.phone }}</a>
              } @else { <span class="muted">—</span> }
            </dd>
            <dt>Service</dt><dd>{{ l.primaryService?.name || '—' }}</dd>
            <dt>Challenges</dt><dd>
              <div class="chips">
                @for (c of l.challengeCategories; track c) {
                <span class="chip">{{ categoryLabel(c) }}</span>
                }
              </div>
            </dd>
            <dt>Situation</dt><dd>{{ l.situationDescription }}</dd>
          </dl>
        </section>

        <section class="card">
          <header class="brief-head">
            <div>
              <h3 class="mb-0">Brand Intelligence Brief</h3>
              @if (l.briefStatus === 'COMPLETED') {
              <span class="badge success">Completed</span>
              } @else {
              <span class="badge warn">Pending — visitor has not yet completed</span>
              }
            </div>
            <button class="btn btn-ghost" (click)="toggleEdit()">{{ editing() ? 'Done editing' : 'Edit fields' }}</button>
          </header>

          @if (l.briefStatus === 'COMPLETED' || editing()) {
          <dl class="kv">
            @for (item of briefRows(); track item.key) {
            <dt>{{ item.label }}</dt>
            <dd>
              @if (editing()) {
              <textarea
                rows="3"
                [ngModel]="item.value"
                (ngModelChange)="onBriefFieldChange(item.key, $event)"
                (blur)="saveBriefFieldIfChanged(item.key)"
                class="brief-edit"></textarea>
              } @else {
              {{ item.value || '—' }}
              }
            </dd>
            }
          </dl>
          } @else {
          <p class="muted">When the visitor completes their brief, it will appear here.</p>
          }

          @if (l.brandBrief && l.brandBrief.audits.length) {
          <h4 class="mt-6">Audit trail</h4>
          <ul class="audit">
            @for (a of l.brandBrief.audits; track a.id) {
            <li>
              <strong>{{ briefFieldLabel(a.fieldName) }}</strong> · {{ a.editedBy.email }} ·
              <span class="muted small">{{ a.editedAt | date:'MMM d, y · h:mm a' }}</span>
              <div class="audit-detail">
                <span class="from">"{{ a.previousValue || '(empty)' }}"</span>
                <span class="arrow">→</span>
                <span class="to">"{{ a.newValue || '(empty)' }}"</span>
              </div>
            </li>
            }
          </ul>
          }
        </section>
      </div>

      <aside class="col-side">
        <section class="card">
          <h3>Internal notes</h3>
          @if (l.notes.length) {
          <ul class="notes">
            @for (n of l.notes; track n.id) {
            <li>
              <header>
                <strong>{{ n.author.email }}</strong>
                <span class="muted small">{{ n.createdAt | date:'MMM d · h:mm a' }}</span>
              </header>
              <p>{{ n.body }}</p>
            </li>
            }
          </ul>
          } @else {
          <p class="muted small">No notes yet.</p>
          }

          <div class="note-form">
            <textarea rows="3" [(ngModel)]="newNote" placeholder="Add a note for the team…"></textarea>
            <button class="btn btn-dark btn-block" (click)="addNote()" [disabled]="!newNote.trim() || addingNote()">
              {{ addingNote() ? 'Saving…' : 'Add note' }}
            </button>
          </div>
        </section>

        <section class="card">
          <h3>Quick actions</h3>
          <a [href]="'mailto:' + l.email" class="btn btn-outline btn-block">Email contact</a>
          @if (l.phone) {
          <a [href]="'tel:' + l.phone" class="btn btn-outline btn-block mt-4">Call contact</a>
          }
        </section>
      </aside>
    </div>
    } @else {
    <p>Lead not found. <a routerLink="/admin/leads">Back to leads</a></p>
    }
  `,
  styles: [
    `
      .back-link { display: inline-block; margin-bottom: 12px; color: var(--gold-dark); font-weight: 600; font-size: 0.9rem; }
      .lead-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: var(--s-5); flex-wrap: wrap; }
      .lead-head h1 { margin: 4px 0; }
      .head-actions { display: flex; gap: 8px; }

      .status-select {
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 8px 16px;
        font-size: 0.9rem;
        font-weight: 600;
        min-height: 40px;
      }
      .status-select.status-new { border-color: var(--info); color: var(--info); }
      .status-select.status-contacted { border-color: var(--warn); color: var(--warn); }
      .status-select.status-closed { border-color: var(--muted); color: var(--muted); }

      .detail-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; }
      .col-main, .col-side { display: flex; flex-direction: column; gap: 16px; }

      .card { padding: var(--s-5); }
      .card h3 { margin: 0 0 12px; }

      .kv { display: grid; grid-template-columns: 160px 1fr; gap: 8px 16px; margin: 0; font-size: 0.95rem; }
      .kv dt { color: var(--muted); font-weight: 600; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.08em; padding-top: 4px; }
      .kv dd { margin: 0; line-height: 1.5; padding-bottom: 8px; border-bottom: 1px solid var(--line); }
      .kv dd:last-of-type { border-bottom: 0; padding-bottom: 0; }

      .chips { display: flex; flex-wrap: wrap; gap: 4px; }
      .chip { background: var(--bone-2); color: var(--espresso); font-size: 0.78rem; padding: 4px 10px; border-radius: 4px; }

      .brief-head { display: flex; justify-content: space-between; align-items: start; gap: 12px; margin-bottom: var(--s-4); flex-wrap: wrap; }
      .brief-edit { font-family: var(--font-sans); font-size: 0.95rem; padding: 10px; width: 100%; }

      .audit { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
      .audit li { padding: 12px; background: var(--bone-2); border-radius: var(--radius-md); }
      .audit-detail { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 6px; font-size: 0.9rem; }
      .audit-detail .from { color: var(--error); text-decoration: line-through; }
      .audit-detail .to { color: var(--success); font-weight: 600; }
      .audit-detail .arrow { color: var(--muted); }

      .notes { list-style: none; padding: 0; margin: 0 0 var(--s-5); display: flex; flex-direction: column; gap: 12px; }
      .notes li { padding: 12px; background: var(--bone-2); border-radius: var(--radius-md); font-size: 0.92rem; }
      .notes header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
      .notes p { margin: 0; }

      .note-form { display: flex; flex-direction: column; gap: 8px; padding-top: var(--s-4); border-top: 1px solid var(--line); }
      .note-form textarea {
        font-family: var(--font-sans);
        padding: 10px;
        border: 1px solid var(--line);
        border-radius: var(--radius-md);
        font-size: 0.95rem;
        resize: vertical;
      }
      .mt-6 { margin-top: var(--s-7); }

      .center { padding: var(--s-7); text-align: center; }
      .error-text { color: var(--error); margin-bottom: 12px; }
      .error-banner {
        background: rgba(178, 58, 58, 0.1);
        color: var(--error);
        border-radius: var(--radius-md);
        padding: 12px 14px;
        font-size: 0.9rem;
        margin-bottom: var(--s-4);
        line-height: 1.4;
      }

      @media (max-width: 980px) {
        .detail-grid { grid-template-columns: 1fr; }
      }
      @media (max-width: 640px) {
        .kv { grid-template-columns: 1fr; gap: 4px; }
        .kv dt { padding-top: 0; margin-top: 8px; }
      }
    `,
  ],
})
export class AdminLeadDetailComponent implements OnInit {
  lead = signal<AdminLeadDetailDto | null>(null);
  editing = signal(false);
  loading = signal(true);
  loadError = signal<string | null>(null);
  saveError = signal<string | null>(null);
  addingNote = signal(false);
  newNote = '';

  /** Local edit state per field. We send a PATCH on blur for each changed
   *  field so the audit log shows the visitor edits separately and we don't
   *  drown the backend in per-keystroke writes. */
  briefDraft = signal<Record<BriefFieldKey, string>>({
    missionStatement: '',
    visionStatement: '',
    differentiator: '',
    brandStory: '',
    audiences: '',
    voiceDescriptors: '',
    successDefinition: '',
  });

  private readonly route = inject(ActivatedRoute);
  private readonly leadsApi = inject(LeadsService);

  private leadId = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe((p) => {
      this.leadId = p.get('id') || '';
      if (this.leadId) this.reload();
    });
  }

  reload(): void {
    if (!this.leadId) return;
    this.loading.set(true);
    this.loadError.set(null);
    this.leadsApi.get(this.leadId).subscribe({
      next: (l) => {
        this.lead.set(l);
        this.briefDraft.set(this.deriveDraft(l.brandBrief));
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.loading.set(false);
        if (err.kind === 'not-found') {
          this.lead.set(null);
        } else {
          this.loadError.set(err.message || 'Could not load lead.');
        }
      },
    });
  }

  private deriveDraft(brief: AdminBrandBriefDto | null): Record<BriefFieldKey, string> {
    return {
      missionStatement: brief?.missionStatement ?? '',
      visionStatement: brief?.visionStatement ?? '',
      differentiator: brief?.differentiator ?? '',
      brandStory: brief?.brandStory ?? '',
      audiences: brief?.audiences ?? '',
      voiceDescriptors: brief?.voiceDescriptors ?? '',
      successDefinition: brief?.successDefinition ?? '',
    };
  }

  briefRows(): BriefRow[] {
    const draft = this.briefDraft();
    return [
      { label: 'Mission', key: 'missionStatement', value: draft.missionStatement },
      { label: 'Vision', key: 'visionStatement', value: draft.visionStatement },
      { label: 'Differentiator', key: 'differentiator', value: draft.differentiator },
      { label: 'Brand story', key: 'brandStory', value: draft.brandStory },
      { label: 'Audiences', key: 'audiences', value: draft.audiences },
      { label: 'Voice', key: 'voiceDescriptors', value: draft.voiceDescriptors },
      { label: 'Success', key: 'successDefinition', value: draft.successDefinition },
    ];
  }

  briefFieldLabel(field: string): string {
    const map: Record<string, string> = {
      missionStatement: 'Mission',
      visionStatement: 'Vision',
      differentiator: 'Differentiator',
      brandStory: 'Brand story',
      audiences: 'Audiences',
      voiceDescriptors: 'Voice',
      successDefinition: 'Success',
    };
    return map[field] || field;
  }

  categoryLabel(c: ChallengeCategoryEnum): string {
    return CHALLENGE_CATEGORY_LABELS[c] || c;
  }

  toggleEdit(): void {
    this.editing.update((v) => !v);
  }

  onBriefFieldChange(key: BriefFieldKey, value: string): void {
    this.briefDraft.update((d) => ({ ...d, [key]: value }));
  }

  saveBriefFieldIfChanged(key: BriefFieldKey): void {
    const lead = this.lead();
    if (!lead) return;
    const newValue = this.briefDraft()[key];
    const previousValue = (lead.brandBrief as Record<BriefFieldKey, string | null> | null)?.[key] ?? '';
    if (newValue === previousValue) return;

    this.leadsApi.updateBriefField(this.leadId, key, newValue).subscribe({
      next: () => this.reload(), // pulls down a fresh audit row
      error: (err: ApiError) => {
        this.saveError.set(err.message || 'Could not save brief edit.');
      },
    });
  }

  setStatus(status: LeadStatusEnum): void {
    const lead = this.lead();
    if (!lead) return;
    const prev = lead.leadStatus;
    this.lead.set({ ...lead, leadStatus: status });
    this.leadsApi.updateStatus(lead.id, status).subscribe({
      error: (err: ApiError) => {
        this.lead.set({ ...lead, leadStatus: prev });
        this.saveError.set(err.message || 'Could not update lead status.');
      },
    });
  }

  addNote(): void {
    const body = this.newNote.trim();
    if (!body || this.addingNote()) return;
    this.addingNote.set(true);
    this.leadsApi.addNote(this.leadId, body).subscribe({
      next: (note: AdminLeadNoteDto) => {
        const lead = this.lead();
        if (lead) this.lead.set({ ...lead, notes: [note, ...lead.notes] });
        this.newNote = '';
        this.addingNote.set(false);
      },
      error: (err: ApiError) => {
        this.addingNote.set(false);
        this.saveError.set(err.message || 'Could not save note.');
      },
    });
  }
}
