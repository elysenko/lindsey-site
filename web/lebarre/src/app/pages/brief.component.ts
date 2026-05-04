import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrandMarkComponent } from '../components/brand-mark.component';
import { BrandBriefService } from '../services/brand-brief.service';
import { ApiError } from '../services/http-error';
import { UpsertBriefRequest } from '../services/api-types';

@Component({
  selector: 'app-brief',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BrandMarkComponent],
  template: `
    <div class="brief-page">
      <header class="brief-bar">
        <div class="container bar-inner">
          <a href="/" class="brand-link"><app-brand-mark [showTagline]="false"></app-brand-mark></a>
        </div>
      </header>

      <main class="brief-main">
        <div class="container">
          @if (loading()) {
          <section class="card center"><p class="muted">Loading your brief…</p></section>
          } @else if (notFound()) {
          <section class="not-found card">
            <span class="badge warn">404 · Token not found</span>
            <h1>This brief link is no longer valid.</h1>
            <p class="muted">It may have been superseded, or it may have expired. To pick up where you left off, please contact us directly.</p>
            <div class="row">
              <a href="mailto:hello@lebarregroup.example" class="btn btn-dark">Email a partner</a>
              <a href="tel:+12025550140" class="btn btn-outline">+1 (202) 555-0140</a>
            </div>
          </section>
          } @else if (submitted()) {
          <section class="success card">
            <div class="success-hero">
              <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden="true">
                <circle cx="30" cy="30" r="28" fill="none" stroke="#4F7B3F" stroke-width="2.5" />
                <path d="M18 30 L27 38 L42 22" fill="none" stroke="#4F7B3F" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <h1>Brief received.</h1>
            <p class="lead">Thank you. Your senior partner will read this before your call. We will follow up with a tailored agenda by end of business tomorrow.</p>
            <a routerLink="/" class="btn btn-outline">Return home</a>
          </section>
          } @else {
          <section class="brief-grid">
            <header class="brief-head">
              <span class="eyebrow">Brand Intelligence Brief</span>
              <h1>Tell us how your organization sees itself.</h1>
              <p class="lead muted">
                Six short prompts. All optional. The more you share, the more
                useful our first call will be — but you can return any field blank.
              </p>
              @if (greetingName()) {
              <p class="muted">Welcome back, {{ greetingName() }}.</p>
              }
              <div class="meta-row">
                <span class="badge gold">Token: {{ token() }}</span>
                <span class="muted small">Saved on submit · Estimated 8 min</span>
              </div>
            </header>

            <form class="brief-form" (submit)="submit($event)" novalidate>
              <div class="field">
                <label for="mission">Mission statement</label>
                <textarea id="mission" name="mission" rows="3" [(ngModel)]="model.missionStatement" placeholder="Why do you exist as an organization?"></textarea>
              </div>
              <div class="field">
                <label for="vision">Vision statement</label>
                <textarea id="vision" name="vision" rows="3" [(ngModel)]="model.visionStatement" placeholder="What does the world look like if you succeed?"></textarea>
              </div>
              <div class="field">
                <label for="differentiator">Describe what makes your organization different</label>
                <textarea id="differentiator" name="differentiator" rows="3" [(ngModel)]="model.differentiator" placeholder="What only you can say."></textarea>
              </div>
              <div class="field">
                <label for="story">Brand story / founding narrative</label>
                <textarea id="story" name="brandStory" rows="4" [(ngModel)]="model.brandStory" placeholder="The story you tell when someone asks where the firm came from."></textarea>
              </div>
              <div class="field">
                <label for="audiences">Primary audiences and stakeholders</label>
                <textarea id="audiences" name="audiences" rows="3" [(ngModel)]="model.audiences" placeholder="Who do we need to reach and influence?"></textarea>
              </div>
              <div class="field">
                <label for="voice">Brand voice descriptors</label>
                <input id="voice" type="text" name="voiceDescriptors" [(ngModel)]="model.voiceDescriptors" placeholder="e.g. plainspoken, patient, evidence-based, never hyperbolic" />
              </div>
              <div class="field">
                <label for="success">What does a successful outcome look like for your organization?</label>
                <textarea id="success" name="successDefinition" rows="3" [(ngModel)]="model.successDefinition" placeholder="Concrete signals you would point to a year from now."></textarea>
              </div>

              @if (error()) {
              <div class="error-banner" role="alert">{{ error() }}</div>
              }

              <div class="form-actions">
                <button type="submit" class="btn btn-dark" [disabled]="submitting()">
                  {{ submitting() ? 'Submitting…' : 'Submit Brief' }}
                </button>
                <a routerLink="/" class="btn btn-ghost">Save and finish later</a>
              </div>
            </form>
          </section>
          }
        </div>
      </main>

      <footer class="brief-foot">
        <div class="container">
          <span>© {{ year }} The LeBarre Group, LLC.</span>
          <span>All submissions are confidential.</span>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      .brief-page { min-height: 100vh; min-height: 100svh; background: var(--bone); display: flex; flex-direction: column; }
      .brief-bar { background: var(--espresso); color: var(--bone); padding: 14px 0; }
      .bar-inner { display: flex; align-items: center; }
      ::ng-deep .brief-bar .brand-name { color: var(--bone) !important; }
      ::ng-deep .brief-bar .brand-sub { color: var(--gold-light) !important; }

      .brief-main { flex: 1; padding: clamp(40px, 6vw, 72px) 0; }
      .brief-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 32px;
        max-width: 760px;
        margin: 0 auto;
      }
      .brief-head { text-align: center; }
      .brief-head h1 { margin-top: 8px; }
      .meta-row { display: flex; justify-content: center; gap: 16px; margin-top: var(--s-4); flex-wrap: wrap; }

      .brief-form {
        background: #fff;
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        padding: var(--s-7);
        box-shadow: var(--shadow-sm);
      }
      .form-actions { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: var(--s-5); flex-wrap: wrap; }

      .not-found, .success, .center {
        max-width: 560px;
        margin: 0 auto;
        text-align: center;
        padding: var(--s-9) var(--s-6);
      }
      .success-hero { margin-bottom: var(--s-5); }
      .row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

      .error-banner {
        background: rgba(178, 58, 58, 0.1);
        color: var(--error);
        border-radius: var(--radius-md);
        padding: 12px 14px;
        font-size: 0.9rem;
        margin-top: 16px;
        line-height: 1.4;
      }

      .brief-foot {
        background: var(--espresso);
        color: rgba(245, 241, 235, 0.6);
        padding: 18px 0;
        font-size: 0.82rem;
      }
      .brief-foot .container { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }

      @media (max-width: 768px) {
        .brief-form { padding: var(--s-5); }
      }
    `,
  ],
})
export class BriefComponent implements OnInit {
  token = signal<string>('');
  notFound = signal(false);
  submitted = signal(false);
  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  greetingName = signal<string | null>(null);
  year = new Date().getFullYear();

  /** Form model. Mirrors backend UpsertBriefRequest field names so we can
   *  send the model directly. */
  model: UpsertBriefRequest = {
    missionStatement: '',
    visionStatement: '',
    differentiator: '',
    brandStory: '',
    audiences: '',
    voiceDescriptors: '',
    successDefinition: '',
  };

  private readonly route = inject(ActivatedRoute);
  private readonly briefs = inject(BrandBriefService);

  ngOnInit(): void {
    this.route.paramMap.subscribe((p) => {
      const t = p.get('token') || '';
      this.token.set(t);
      if (!t) {
        this.loading.set(false);
        this.notFound.set(true);
        return;
      }
      this.loadShell(t);
    });
  }

  private loadShell(token: string): void {
    this.loading.set(true);
    this.briefs.load(token).subscribe({
      next: (shell) => {
        this.greetingName.set(shell.fullName);
        // If they previously submitted, the server may already have a brief —
        // if briefStatus is COMPLETED we still let them re-submit (per spec
        // the admin can also enrich), but pre-populate the fields.
        if (shell.brief) {
          this.model = {
            missionStatement: shell.brief.missionStatement ?? '',
            visionStatement: shell.brief.visionStatement ?? '',
            differentiator: shell.brief.differentiator ?? '',
            brandStory: shell.brief.brandStory ?? '',
            audiences: shell.brief.audiences ?? '',
            voiceDescriptors: shell.brief.voiceDescriptors ?? '',
            successDefinition: shell.brief.successDefinition ?? '',
          };
        }
        if (shell.briefStatus === 'COMPLETED') {
          // Treat as already submitted — show confirmation, allow returning home.
          this.submitted.set(true);
        }
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.loading.set(false);
        if (err.kind === 'not-found') {
          this.notFound.set(true);
        } else {
          this.error.set(err.message);
        }
      },
    });
  }

  submit(ev: Event): void {
    ev.preventDefault();
    if (this.submitting()) return;
    this.submitting.set(true);
    this.error.set(null);

    // Strip empties so the backend "must contain at least one field" check
    // gives a useful message and we don't send blank strings as values.
    const payload: UpsertBriefRequest = {};
    for (const [k, v] of Object.entries(this.model) as [keyof UpsertBriefRequest, string][]) {
      const trimmed = (v ?? '').trim();
      if (trimmed) payload[k] = trimmed;
    }

    if (Object.keys(payload).length === 0) {
      this.submitting.set(false);
      this.error.set('Please complete at least one field before submitting.');
      return;
    }

    this.briefs.submit(this.token(), payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },
      error: (err: ApiError) => {
        this.submitting.set(false);
        if (err.kind === 'not-found') this.notFound.set(true);
        else this.error.set(err.message);
      },
    });
  }
}
