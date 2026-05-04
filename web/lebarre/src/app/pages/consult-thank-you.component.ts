import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BrandMarkComponent } from '../components/brand-mark.component';

@Component({
  selector: 'app-consult-thank-you',
  standalone: true,
  imports: [CommonModule, RouterLink, BrandMarkComponent],
  template: `
    <div class="ty-page">
      <header class="ty-bar">
        <div class="container bar-inner">
          <a href="/" class="brand-link">
            <app-brand-mark [showTagline]="false"></app-brand-mark>
          </a>
        </div>
      </header>

      <main class="ty-main">
        <div class="container ty-grid">
          <section class="ty-copy">
            <span class="check-pill">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M5 12.5L10 17L19 8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Submission received
            </span>
            <h1>Thank you, {{ contactName() }}.</h1>
            <p class="lead">
              A senior partner has been alerted and will reply within one business day.
              While you wait, you can do two useful things:
            </p>

            <div class="step-list">
              <article class="step">
                <span class="num">01</span>
                <div class="step-body">
                  <h3>Complete your Brand Intelligence Brief</h3>
                  <p>Six short questions about mission, vision, and what success looks like. It makes our first call ten times more productive — and it is entirely optional.</p>
                  @if (briefToken()) {
                  <a [routerLink]="['/brief', briefToken()]" class="btn btn-dark">Open my Brand Brief →</a>
                  } @else {
                  <a routerLink="/consult" class="btn btn-outline">Start over</a>
                  }
                </div>
              </article>

              <article class="step">
                <span class="num">02</span>
                <div class="step-body">
                  <h3>Book your call directly</h3>
                  <p>If you would rather skip the email exchange and put time on the calendar, our consultation slots are below.</p>
                </div>
              </article>
            </div>
          </section>

          <aside class="cal-pane">
            <div class="cal-card">
              <div class="cal-head">
                <h4>Book a 30-minute consultation</h4>
                <p class="muted small">Free · Under NDA · Senior partner</p>
              </div>
              <!-- Calendly-style placeholder -->
              <div class="cal-body" role="region" aria-label="Calendar">
                <div class="cal-month">
                  <span class="cal-nav" aria-hidden="true">‹</span>
                  <span class="cal-title">May 2026</span>
                  <span class="cal-nav" aria-hidden="true">›</span>
                </div>
                <div class="cal-grid">
                  @for (d of weekdays; track d) { <span class="dow">{{ d }}</span> }
                  @for (n of days; track n) {
                  <button
                    type="button"
                    class="day"
                    [class.selected]="selectedDay() === n"
                    [class.muted-day]="n < 5 || n > 28"
                    (click)="pickDay(n)">{{ n }}</button>
                  }
                </div>
              </div>
              <div class="cal-times">
                <p class="time-label">{{ timeLabel() }}</p>
                <div class="time-grid">
                  @for (t of times; track t) {
                  <button class="time" type="button" (click)="confirmBooking(t)">{{ t }}</button>
                  }
                </div>
              </div>
              @if (booked()) {
              <div class="booked">
                <strong>Booked:</strong> {{ booked() }} — confirmation sent to your inbox.
              </div>
              }
            </div>
            <p class="cal-help small">
              Powered by Calendly · All times Eastern · You will receive a calendar invite within minutes of booking.
            </p>
          </aside>
        </div>
      </main>

      <footer class="ty-foot">
        <div class="container">
          <span>© {{ year }} The LeBarre Group, LLC.</span>
          <a routerLink="/">Return home →</a>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      .ty-page {
        min-height: 100vh;
        min-height: 100svh;
        background: var(--bone);
        display: flex;
        flex-direction: column;
      }
      .ty-bar {
        background: var(--espresso);
        color: var(--bone);
        padding: 14px 0;
      }
      .bar-inner { display: flex; align-items: center; }
      ::ng-deep .ty-bar .brand-name { color: var(--bone) !important; }
      ::ng-deep .ty-bar .brand-sub { color: var(--gold-light) !important; }

      .ty-main { flex: 1; padding: clamp(40px, 7vw, 80px) 0; }
      .ty-grid {
        display: grid;
        grid-template-columns: 1.1fr 1fr;
        gap: 64px;
        align-items: start;
      }

      .check-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(79, 123, 63, 0.15);
        color: var(--success);
        padding: 6px 14px;
        border-radius: 999px;
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: 16px;
      }
      .check-pill svg { color: var(--success); }
      .lead { font-size: 1.15rem; max-width: 56ch; }

      .step-list { display: flex; flex-direction: column; gap: 24px; margin-top: var(--s-6); }
      .step {
        display: grid;
        grid-template-columns: 56px 1fr;
        gap: 20px;
        background: #fff;
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        padding: var(--s-6);
      }
      .step .num {
        font-family: var(--font-serif);
        font-size: 2rem;
        color: var(--gold);
        font-weight: 600;
      }
      .step h3 { margin: 0 0 8px; }

      .cal-pane { position: sticky; top: 24px; }
      .cal-card {
        background: #fff;
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        padding: var(--s-5);
        box-shadow: var(--shadow-md);
      }
      .cal-head { padding-bottom: 12px; border-bottom: 1px solid var(--line); margin-bottom: 16px; }
      .cal-head h4 { margin: 0 0 4px; }
      .cal-month {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-weight: 600;
        font-family: var(--font-serif);
      }
      .cal-nav { font-size: 1.4rem; color: var(--muted); cursor: pointer; }
      .cal-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
      }
      .dow { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); text-align: center; padding: 4px 0; font-weight: 600; }
      .day {
        aspect-ratio: 1;
        background: var(--bone);
        border: 0;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        color: var(--ink);
      }
      .day:hover { background: var(--gold-light); color: var(--espresso); }
      .day.selected { background: var(--espresso); color: var(--bone); }
      .day.muted-day { color: var(--muted); opacity: 0.4; }

      .cal-times { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--line); }
      .time-label { font-size: 0.85rem; color: var(--muted); margin: 0 0 12px; font-weight: 600; }
      .time-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .time {
        padding: 10px;
        background: var(--bone);
        border: 1px solid var(--line);
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--ink);
        min-height: 44px;
      }
      .time:hover { background: var(--gold); border-color: var(--gold); color: var(--espresso); }

      .booked {
        margin-top: 16px;
        padding: 12px 16px;
        background: rgba(79, 123, 63, 0.1);
        border-radius: var(--radius-md);
        color: var(--success);
        font-size: 0.9rem;
      }
      .cal-help { display: block; text-align: center; color: var(--muted); margin-top: 12px; }

      .ty-foot {
        background: var(--espresso);
        color: rgba(245, 241, 235, 0.6);
        padding: 18px 0;
        font-size: 0.82rem;
      }
      .ty-foot .container { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
      .ty-foot a { color: var(--gold-light); }

      @media (max-width: 980px) {
        .ty-grid { grid-template-columns: 1fr; gap: 32px; }
        .cal-pane { position: static; }
      }
    `,
  ],
})
export class ConsultThankYouComponent implements OnInit {
  weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  days = Array.from({ length: 31 }, (_, i) => i + 1);
  times = ['9:00 AM', '10:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'];

  selectedDay = signal<number | null>(12);
  briefToken = signal<string | null>(null);
  contactName = signal<string>('there');
  booked = signal<string | null>(null);
  year = new Date().getFullYear();

  constructor(private router: Router) {}

  ngOnInit(): void {
    const token = sessionStorage.getItem('lebarre.briefToken');
    const name = sessionStorage.getItem('lebarre.contactName');
    if (!token) {
      // Guard against direct navigation without a token
      this.router.navigate(['/consult']);
      return;
    }
    this.briefToken.set(token);
    if (name) this.contactName.set(name.split(' ')[0]);
  }

  pickDay(n: number): void { this.selectedDay.set(n); }
  timeLabel(): string {
    const d = this.selectedDay();
    if (!d) return 'Select a day';
    return `Available · Tue, May ${d}`;
  }
  confirmBooking(t: string): void {
    const d = this.selectedDay();
    this.booked.set(`Tue, May ${d} · ${t} ET`);
  }
}
