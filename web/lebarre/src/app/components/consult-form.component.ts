import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SERVICES } from '../data/site-data';
import { ConsultationService } from '../services/consultation.service';
import {
  CHALLENGE_CATEGORY_LABELS,
  ChallengeCategoryEnum,
  CreateConsultationRequest,
  LABEL_TO_CHALLENGE_CATEGORY,
} from '../services/api-types';
import { ApiError } from '../services/http-error';

interface ChallengeOption {
  label: string;
  value: ChallengeCategoryEnum;
}

@Component({
  selector: 'app-consult-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form class="consult-form" (submit)="onSubmit($event)" novalidate>
      <div class="step-indicator" aria-label="Form progress">
        <span class="step" [class.active]="step() >= 1" [class.complete]="step() > 1">
          <span class="num">1</span> Contact
        </span>
        <span class="rule"></span>
        <span class="step" [class.active]="step() >= 2">
          <span class="num">2</span> Engagement
        </span>
      </div>

      @if (step() === 1) {
      <div class="grid grid-2">
        <div class="field" [class.has-error]="errors().fullName">
          <label for="fullName">Full name <span class="req">*</span></label>
          <input id="fullName" type="text" [(ngModel)]="model.fullName" name="fullName" autocomplete="name" />
          @if (errors().fullName) { <p class="field-error">Please tell us your full name.</p> }
        </div>
        <div class="field" [class.has-error]="errors().organization">
          <label for="organization">Organization <span class="req">*</span></label>
          <input id="organization" type="text" [(ngModel)]="model.organization" name="organization" autocomplete="organization" />
          @if (errors().organization) { <p class="field-error">Organization is required.</p> }
        </div>
        <div class="field" [class.has-error]="errors().email">
          <label for="email">Email <span class="req">*</span></label>
          <input id="email" type="email" [(ngModel)]="model.email" name="email" autocomplete="email" />
          @if (errors().email === 'required') { <p class="field-error">Email is required.</p> }
          @if (errors().email === 'invalid') { <p class="field-error">Please enter a valid email address.</p> }
        </div>
        <div class="field" [class.has-error]="errors().phone">
          <label for="phone">Phone</label>
          <input id="phone" type="tel" [(ngModel)]="model.phone" name="phone" autocomplete="tel" />
          <p class="help-text">Optional — useful for time-sensitive matters.</p>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-primary btn-block-mobile" (click)="next()">Continue</button>
      </div>
      <p class="privacy small muted">By submitting, you agree to our Privacy Policy. We respond within one business day.</p>
      }

      @if (step() === 2) {
      <div class="field" [class.has-error]="errors().serviceInterest">
        <label for="service">Primary service interest <span class="req">*</span></label>
        <select id="service" [(ngModel)]="model.serviceInterest" name="serviceInterest">
          <option value="">Select a service…</option>
          @for (svc of services; track svc.slug) {
          <option [value]="svc.slug">{{ svc.name }}</option>
          }
          <option value="not-sure">Not sure yet</option>
        </select>
        @if (errors().serviceInterest) { <p class="field-error">Please choose a service interest.</p> }
      </div>

      <div class="field" [class.has-error]="errors().challenges">
        <label>Challenge categories <span class="req">*</span></label>
        <p class="help-text mb-2">Select all that apply.</p>
        <div class="checks">
          @for (cat of challenges; track cat.value) {
          <label class="check">
            <input
              type="checkbox"
              [value]="cat.value"
              [checked]="model.challenges.includes(cat.value)"
              (change)="toggleChallenge(cat.value)" />
            <span>{{ cat.label }}</span>
          </label>
          }
        </div>
        @if (errors().challenges) { <p class="field-error">Select at least one challenge category.</p> }
      </div>

      <div class="field">
        <label for="situation">Briefly describe your situation <span class="req">*</span></label>
        <textarea id="situation" [(ngModel)]="model.situation" name="situation" rows="5" placeholder="What is happening, what is at stake, and what does success look like?"></textarea>
        @if (errors().situation) { <p class="field-error">Please describe your situation.</p> }
      </div>

      @if (banner()) {
      <div class="error-banner" role="alert">{{ banner() }}</div>
      }

      <div class="form-actions">
        <button type="button" class="btn btn-ghost" (click)="back()" [disabled]="submitting()">← Back</button>
        <button type="submit" class="btn btn-primary" [disabled]="submitting()">
          {{ submitting() ? 'Sending…' : 'Send to LeBarre Group' }}
        </button>
      </div>
      <p class="privacy small muted">A senior partner replies within one business day. Active crises: call <a href="tel:+12025550140">+1 (202) 555-0140</a>.</p>
      }
    </form>
  `,
  styles: [
    `
      .consult-form {
        background: #fff;
        border-radius: var(--radius-lg);
        border: 1px solid var(--line);
        padding: var(--s-6);
        box-shadow: var(--shadow-md);
      }
      .step-indicator {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: var(--s-5);
        font-size: 0.85rem;
        color: var(--muted);
        font-weight: 600;
      }
      .step {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
      }
      .step .num {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 999px;
        background: var(--bone-2);
        color: var(--muted);
        font-weight: 700;
        font-size: 0.85rem;
      }
      .step.active .num { background: var(--gold); color: var(--espresso); }
      .step.active { color: var(--espresso); }
      .step.complete .num { background: var(--espresso); color: var(--bone); }
      .rule { flex: 1; height: 1px; background: var(--line); }

      .req { color: var(--gold-dark); margin-left: 2px; }

      .checks {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .check {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        border: 1px solid var(--line);
        border-radius: var(--radius-md);
        cursor: pointer;
        font-size: 0.95rem;
        min-height: 48px;
        transition: border-color 0.15s ease, background 0.15s ease;
      }
      .check input { width: 18px; height: 18px; accent-color: var(--gold); flex: 0 0 auto; }
      .check:hover { border-color: var(--gold); background: rgba(184, 144, 85, 0.04); }
      .check:has(input:checked) { border-color: var(--gold); background: rgba(184, 144, 85, 0.08); }

      .form-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: var(--s-5);
      }
      .btn-block-mobile { min-width: 220px; }
      .privacy { margin-top: 16px; }

      .error-banner {
        background: rgba(178, 58, 58, 0.1);
        color: var(--error);
        border-radius: var(--radius-md);
        padding: 12px 14px;
        font-size: 0.9rem;
        margin-top: 16px;
        line-height: 1.4;
      }

      @media (max-width: 768px) {
        .consult-form { padding: var(--s-5); }
        .checks { grid-template-columns: 1fr; }
        .form-actions { flex-direction: column-reverse; align-items: stretch; }
        .form-actions .btn { width: 100%; }
      }
    `,
  ],
})
export class ConsultFormComponent {
  step = signal(1);
  submitting = signal(false);
  banner = signal<string | null>(null);

  /** Service options pulled from local data; the slug matches the backend
   *  Service.slug seeded by `backend/src/prisma/seed.ts`. */
  services = SERVICES;

  /** Backend ChallengeCategory enum + UI label, kept aligned with the spec
   *  wording so the form matches the design and the API. */
  challenges: ChallengeOption[] = (
    Object.keys(CHALLENGE_CATEGORY_LABELS) as ChallengeCategoryEnum[]
  ).map((value) => ({
    value,
    // Stable iteration order via Object.keys is fine because the enum is
    // declared in spec order; if backend re-orders, swap to an explicit list.
    label: CHALLENGE_CATEGORY_LABELS[value] ?? value,
  }));

  model = {
    fullName: '',
    organization: '',
    email: '',
    phone: '',
    serviceInterest: '',
    challenges: [] as ChallengeCategoryEnum[],
    situation: '',
  };

  errors = signal<{
    fullName?: boolean;
    organization?: boolean;
    email?: 'required' | 'invalid' | false;
    phone?: boolean;
    serviceInterest?: boolean;
    challenges?: boolean;
    situation?: boolean;
  }>({});

  private readonly consultations = inject(ConsultationService);
  private readonly router = inject(Router);

  toggleChallenge(value: ChallengeCategoryEnum): void {
    const arr = this.model.challenges.slice();
    const i = arr.indexOf(value);
    if (i >= 0) arr.splice(i, 1);
    else arr.push(value);
    this.model.challenges = arr;
    if (arr.length) this.errors.update((e) => ({ ...e, challenges: false }));
  }

  validateStep1(): boolean {
    const e: { fullName?: boolean; organization?: boolean; email?: 'required' | 'invalid' } = {};
    if (!this.model.fullName.trim()) e.fullName = true;
    if (!this.model.organization.trim()) e.organization = true;
    if (!this.model.email.trim()) e.email = 'required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.model.email)) e.email = 'invalid';
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  validateStep2(): boolean {
    const e: {
      serviceInterest?: boolean;
      challenges?: boolean;
      situation?: boolean;
    } = {};
    if (!this.model.serviceInterest) e.serviceInterest = true;
    if (!this.model.challenges.length) e.challenges = true;
    if (!this.model.situation.trim()) e.situation = true;
    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  next(): void {
    if (this.validateStep1()) this.step.set(2);
  }
  back(): void {
    this.step.set(1);
  }

  onSubmit(ev: Event): void {
    ev.preventDefault();
    if (!this.validateStep2()) return;
    if (this.submitting()) return;

    this.submitting.set(true);
    this.banner.set(null);

    const payload: CreateConsultationRequest = {
      fullName: this.model.fullName.trim(),
      organization: this.model.organization.trim(),
      email: this.model.email.trim(),
      phone: this.model.phone.trim() || undefined,
      // The form stores the service slug directly. "not-sure" is sent as
      // undefined so the backend doesn't try to FK it.
      primaryServiceSlug:
        this.model.serviceInterest && this.model.serviceInterest !== 'not-sure'
          ? this.model.serviceInterest
          : undefined,
      challengeCategories: this.model.challenges,
      situationDescription: this.model.situation.trim(),
    };

    this.consultations.submit(payload).subscribe({
      next: (res) => {
        // Hand the token to the thank-you page. We use sessionStorage rather
        // than query params so the URL stays clean and shareable links don't
        // leak someone else's brief token.
        try {
          sessionStorage.setItem('lebarre.briefToken', res.briefToken);
          sessionStorage.setItem('lebarre.contactName', this.model.fullName);
        } catch {
          /* private mode; just navigate without persisting */
        }
        this.submitting.set(false);
        this.router.navigate(['/consult/thank-you']);
      },
      error: (err: ApiError) => {
        this.submitting.set(false);
        if (err.kind === 'rate-limited') {
          this.banner.set(
            err.message ||
              'You have submitted several requests in a short period. Please contact us directly by phone or email.',
          );
        } else if (err.kind === 'validation') {
          this.applyFieldErrors(err.fieldErrors, err.message);
        } else if (err.kind === 'network') {
          this.banner.set(err.message);
        } else {
          this.banner.set(err.message || 'Something went wrong. Please try again or call +1 (202) 555-0140.');
        }
      },
    });
  }

  /** Map server-reported field errors back onto the form. The backend
   *  reports `["fullName must be longer than..."]` style strings; we do a
   *  coarse mapping so at least the right field highlights. */
  private applyFieldErrors(fieldErrors: Record<string, string[]>, fallback: string): void {
    const next: ReturnType<typeof this.errors> = {};
    const known: Array<keyof typeof next> = [
      'fullName',
      'organization',
      'email',
      'phone',
      'serviceInterest',
      'challenges',
      'situation',
    ];
    let matched = false;
    for (const key of Object.keys(fieldErrors)) {
      const lower = key.charAt(0).toLowerCase() + key.slice(1);
      const k = known.find((n) => n === lower);
      if (!k) continue;
      matched = true;
      if (k === 'email') next.email = 'invalid';
      else (next as Record<string, unknown>)[k] = true;
    }
    if (matched) {
      this.errors.set(next);
      this.banner.set('Please correct the highlighted fields.');
    } else {
      this.banner.set(fallback);
    }
  }
}
