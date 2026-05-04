import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TESTIMONIALS, CLIENT_LOGOS } from '../data/site-data';
import { JsonLdService } from '../services/json-ld.service';
import { ConsultFormComponent } from '../components/consult-form.component';
import { BrandMarkComponent } from '../components/brand-mark.component';

@Component({
  selector: 'app-consult',
  standalone: true,
  imports: [CommonModule, ConsultFormComponent, BrandMarkComponent],
  template: `
    <!-- Distraction-free landing — no global nav -->
    <div class="consult-page">
      <header class="consult-bar">
        <div class="container bar-inner">
          <a href="/" class="brand-link" aria-label="The LeBarre Group home">
            <app-brand-mark [showTagline]="false" [dark]="true"></app-brand-mark>
          </a>
          <span class="phone-chip">
            <span class="dot"></span>
            <a href="tel:+12025550140">Active crisis? +1 (202) 555-0140</a>
          </span>
        </div>
      </header>

      <main class="consult-main">
        <div class="container consult-grid">
          <div class="value">
            <span class="eyebrow">Free 30-minute consultation</span>
            <h1>The first call is calm.<br />The next call is yours.</h1>
            <p class="lead">
              A senior partner — not an account executive — meets you under NDA
              within one business day. We listen, we read the situation, and we
              tell you honestly whether this is a fit before any fee is named.
            </p>

            <ul class="value-list">
              <li><span class="dot"></span>Senior partner on every call</li>
              <li><span class="dot"></span>Under NDA the moment you ask</li>
              <li><span class="dot"></span>Reply within one business day</li>
              <li><span class="dot"></span>No commitment from this conversation</li>
            </ul>

            <figure class="testimonial">
              <blockquote>{{ testimonial.quote }}</blockquote>
              <figcaption>
                <strong>{{ testimonial.author }}</strong>
                <span>{{ testimonial.role }}</span>
              </figcaption>
            </figure>

            <div class="logos">
              <p class="logo-label">Trusted by leaders across</p>
              <div class="logo-row">
                @for (l of logos; track l) { <span>{{ l }}</span> }
              </div>
            </div>
          </div>

          <div class="form-pane">
            <app-consult-form></app-consult-form>
          </div>
        </div>
      </main>

      <footer class="consult-foot">
        <div class="container">
          <span>© {{ year }} The LeBarre Group, LLC.</span>
          <span>hello&#64;lebarregroup.example · +1 (202) 555-0140</span>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      .consult-page {
        min-height: 100vh;
        min-height: 100svh;
        background: var(--bone);
        display: flex;
        flex-direction: column;
      }
      .consult-bar {
        background: var(--espresso);
        color: var(--bone);
        padding: 14px 0;
      }
      .bar-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .brand-link { text-decoration: none; }
      ::ng-deep .consult-bar .brand-name { color: var(--bone) !important; }
      ::ng-deep .consult-bar .brand-sub { color: var(--gold-light) !important; }

      .phone-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85rem;
        color: rgba(245, 241, 235, 0.85);
      }
      .phone-chip .dot {
        width: 8px; height: 8px;
        background: #58c27d;
        border-radius: 50%;
        box-shadow: 0 0 0 4px rgba(88, 194, 125, 0.18);
      }
      .phone-chip a { color: var(--gold-light); font-weight: 600; }

      .consult-main { flex: 1; padding: clamp(40px, 7vw, 80px) 0; }
      .consult-grid {
        display: grid;
        grid-template-columns: 1fr 1.05fr;
        gap: 64px;
        align-items: start;
      }
      .value h1 { font-size: clamp(2rem, 4.4vw, 3rem); }
      .lead { font-size: 1.15rem; max-width: 56ch; color: var(--ink); }
      .value-list {
        list-style: none;
        padding: 0;
        margin: var(--s-5) 0 var(--s-7);
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 16px;
        font-size: 0.95rem;
      }
      .value-list li { display: flex; align-items: center; gap: 10px; }
      .value-list .dot {
        width: 7px; height: 7px;
        border-radius: 50%;
        background: var(--gold);
        flex: 0 0 auto;
      }

      .testimonial {
        background: #fff;
        border-left: 3px solid var(--gold);
        padding: var(--s-5) var(--s-6);
        margin: 0 0 var(--s-6);
        border-radius: var(--radius-md);
      }
      .testimonial blockquote {
        font-family: var(--font-serif);
        font-size: 1.1rem;
        line-height: 1.5;
        margin: 0 0 12px;
        color: var(--ink);
      }
      .testimonial figcaption strong { display: block; font-size: 0.95rem; color: var(--espresso); }
      .testimonial figcaption span { font-size: 0.85rem; color: var(--muted); }

      .logos { padding-top: var(--s-5); border-top: 1px solid var(--line); }
      .logo-label {
        font-size: 0.75rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--muted);
        font-weight: 600;
        margin: 0 0 12px;
      }
      .logo-row {
        display: flex;
        flex-wrap: wrap;
        gap: 18px 28px;
      }
      .logo-row span {
        font-family: var(--font-serif);
        font-size: 0.95rem;
        letter-spacing: 0.12em;
        color: var(--muted);
        font-weight: 600;
      }

      .form-pane { position: sticky; top: 24px; }

      .consult-foot {
        background: var(--espresso);
        color: rgba(245, 241, 235, 0.6);
        padding: 18px 0;
        font-size: 0.82rem;
      }
      .consult-foot .container {
        display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;
      }

      @media (max-width: 980px) {
        .consult-grid { grid-template-columns: 1fr; gap: 32px; }
        .form-pane { position: static; }
        .value-list { grid-template-columns: 1fr; }
      }
      @media (max-width: 540px) {
        .bar-inner { flex-direction: column; align-items: flex-start; gap: 8px; }
        .phone-chip { font-size: 0.78rem; }
      }
    `,
  ],
})
export class ConsultComponent implements OnInit {
  testimonial = TESTIMONIALS[1];
  logos = CLIENT_LOGOS.slice(0, 4);
  year = new Date().getFullYear();

  private jsonLd = inject(JsonLdService);

  ngOnInit(): void {
    this.jsonLd.set([
      this.jsonLd.organization(),
      this.jsonLd.breadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Consult', url: '/consult' },
      ]),
    ]);
  }
}
