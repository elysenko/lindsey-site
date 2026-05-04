import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TESTIMONIALS, CLIENT_LOGOS } from '../data/site-data';
import { JsonLdService } from '../services/json-ld.service';
import { ContentService } from '../services/content.service';
import { ServiceDto } from '../services/api-types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- HERO -->
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-copy">
          <span class="eyebrow">Crisis Communications &amp; Strategy</span>
          <h1>
            Preparation that <em class="serif gold-em">performs</em><br />
            when the moment will not wait.
          </h1>
          <p class="lead">
            The LeBarre Group counsels CEOs, boards, and institutions through
            reputational threats and the multi-year work of building trust that
            holds. Calm in the moment. Disciplined over time.
          </p>
          <div class="hero-ctas">
            <a routerLink="/consult" class="btn btn-primary">Request a Consultation</a>
            <a routerLink="/services" class="btn btn-outline">Explore Services</a>
          </div>

          <div class="proof">
            <div class="proof-item">
              <span class="num">200+</span>
              <span class="label">Active crises<br />led through resolution</span>
            </div>
            <div class="proof-item">
              <span class="num">12</span>
              <span class="label">Years counseling<br />boards and CEOs</span>
            </div>
            <div class="proof-item">
              <span class="num">94%</span>
              <span class="label">Client retention<br />after first engagement</span>
            </div>
          </div>
        </div>

        <aside class="hero-aside">
          <figure class="testimonial-card">
            <div class="quote-mark" aria-hidden="true">"</div>
            <blockquote>
              {{ featured.quote }}
            </blockquote>
            <figcaption>
              <strong>{{ featured.author }}</strong>
              <span class="muted-light">{{ featured.role }}</span>
            </figcaption>
          </figure>
          <a routerLink="/consult" class="hero-aside-cta">
            Free 30-min consultation →
          </a>
        </aside>
      </div>
    </section>

    <!-- TRUST LOGOS -->
    <section class="trust">
      <div class="container">
        <p class="trust-label">Trusted by leaders across health, finance, philanthropy, and growth-stage business</p>
        <div class="logo-strip">
          @for (logo of logos; track logo) {
          <span class="logo">{{ logo }}</span>
          }
        </div>
      </div>
    </section>

    <!-- SERVICES -->
    <section class="section">
      <div class="container">
        <header class="section-head">
          <span class="eyebrow">What we do</span>
          <h2>Four practices. One operating rhythm.</h2>
          <p class="lead muted">
            Each practice is led by a senior partner. Every engagement runs on a single
            cadence — discovery, narrative, rehearsal, perform.
          </p>
        </header>

        <div class="grid grid-2 services-grid">
          @for (svc of services(); track svc.slug; let i = $index) {
          <a [routerLink]="['/services', svc.slug]" class="svc-card">
            <span class="svc-num">0{{ i + 1 }}</span>
            <h3>{{ svc.name }}</h3>
            <p>{{ svc.shortDescription }}</p>
            <ul class="outcomes">
              @for (o of (svc.keyOutcomes || []).slice(0, 3); track o) {
              <li>{{ o }}</li>
              }
            </ul>
            <span class="link-arrow">Learn more</span>
          </a>
          }
        </div>
      </div>
    </section>

    <!-- PHILOSOPHY -->
    <section class="section section-dark">
      <div class="container philo-grid">
        <div class="philo-copy">
          <span class="eyebrow on-dark">Our methodology</span>
          <h2>Back to the barre.</h2>
          <p class="lead">
            In ballet, the barre is where excellence is built — slowly, deliberately,
            in repeat. We borrow the metaphor on purpose. Crisis response is performance.
            Reputation is performance. The work of holding the line under pressure is
            performance. And like every performance, it is built in rehearsal.
          </p>
          <p>
            "Back to the barre" is how we describe the cadence of our engagements:
            ground in research, drill in rehearsal, perform when it counts, return to the
            barre to refine. Calm is not a temperament. It is a habit, learned in repetition.
          </p>
          <a routerLink="/about" class="btn btn-outline-light mt-4">Read the founding story</a>
        </div>
        <div class="philo-art" aria-hidden="true">
          <div class="barre">
            <div class="barre-bar"></div>
            <div class="barre-rail"></div>
            <div class="barre-rail two"></div>
            <span class="motto">Preparation. Position. Performance.</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section section-bone cta-band">
      <div class="container cta-inner">
        <div>
          <span class="eyebrow">Talk to a senior partner</span>
          <h2 class="mb-2">When the next 72 hours matter,<br />the first call is free.</h2>
          <p class="muted">A 30-minute call, under NDA, with a senior partner. No commitment.</p>
        </div>
        <div class="cta-actions">
          <a routerLink="/consult" class="btn btn-dark">Request a Consultation</a>
          <a href="tel:+12025550140" class="btn btn-outline">+1 (202) 555-0140</a>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      /* HERO */
      .hero {
        background: linear-gradient(180deg, var(--bone) 0%, var(--bone-2) 100%);
        position: relative;
        padding: clamp(40px, 8vw, 96px) 0 clamp(56px, 9vw, 120px);
        overflow: hidden;
      }
      .hero::before {
        content: '';
        position: absolute;
        top: -120px;
        right: -120px;
        width: 380px;
        height: 380px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(184, 144, 85, 0.12), transparent 70%);
        pointer-events: none;
      }
      .hero-grid {
        display: grid;
        grid-template-columns: 1.4fr 0.9fr;
        gap: 64px;
        align-items: center;
      }
      .hero-copy h1 em {
        font-style: italic;
        color: var(--gold-dark);
        font-weight: 600;
      }
      .gold-em { position: relative; }
      .gold-em::after {
        content: '';
        position: absolute;
        left: 0; right: 0; bottom: 4px;
        height: 4px;
        background: var(--gold);
        opacity: 0.4;
        border-radius: 2px;
      }
      .lead {
        font-size: 1.18rem;
        line-height: 1.55;
        color: var(--ink);
        max-width: 56ch;
        margin-top: var(--s-4);
      }
      .hero-ctas {
        display: flex;
        gap: 12px;
        margin-top: var(--s-6);
        flex-wrap: wrap;
      }

      .proof {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        margin-top: var(--s-8);
        padding-top: var(--s-6);
        border-top: 1px solid var(--line);
      }
      .proof-item .num {
        display: block;
        font-family: var(--font-serif);
        font-size: 2.2rem;
        font-weight: 600;
        color: var(--espresso);
      }
      .proof-item .label {
        display: block;
        font-size: 0.82rem;
        color: var(--muted);
        line-height: 1.35;
        margin-top: 2px;
      }

      .hero-aside { display: flex; flex-direction: column; gap: 16px; }
      .testimonial-card {
        background: var(--espresso);
        color: var(--bone);
        border-radius: var(--radius-xl);
        padding: var(--s-7) var(--s-6);
        margin: 0;
        position: relative;
        box-shadow: var(--shadow-lg);
      }
      .quote-mark {
        position: absolute;
        top: 12px;
        left: 24px;
        font-family: var(--font-serif);
        font-size: 5rem;
        line-height: 1;
        color: var(--gold);
        opacity: 0.55;
      }
      .testimonial-card blockquote {
        font-family: var(--font-serif);
        font-size: 1.18rem;
        line-height: 1.45;
        margin: 24px 0 18px;
        color: var(--bone);
      }
      .testimonial-card figcaption {
        display: flex;
        flex-direction: column;
        font-size: 0.92rem;
      }
      .testimonial-card strong { font-weight: 600; }
      .muted-light { color: rgba(245, 241, 235, 0.7); }
      .hero-aside-cta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.9rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--gold-dark);
        padding: 12px;
      }

      /* TRUST */
      .trust {
        background: var(--bone);
        border-top: 1px solid var(--line);
        border-bottom: 1px solid var(--line);
        padding: 36px 0;
      }
      .trust-label {
        text-align: center;
        font-size: 0.78rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--muted);
        margin: 0 0 18px;
        font-weight: 600;
      }
      .logo-strip {
        display: flex;
        justify-content: space-around;
        align-items: center;
        flex-wrap: wrap;
        gap: 30px;
      }
      .logo {
        font-family: var(--font-serif);
        font-weight: 600;
        font-size: 1.05rem;
        letter-spacing: 0.15em;
        color: var(--muted);
        opacity: 0.85;
      }

      /* SECTION */
      .section-head {
        text-align: center;
        max-width: 780px;
        margin: 0 auto var(--s-7);
      }
      .section-head .lead { margin-left: auto; margin-right: auto; }

      .services-grid { gap: 24px; }
      .svc-card {
        display: block;
        background: #fff;
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        padding: var(--s-7);
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        text-decoration: none;
        color: inherit;
      }
      .svc-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-color: var(--gold);
      }
      .svc-num {
        font-family: var(--font-serif);
        font-size: 0.9rem;
        color: var(--gold-dark);
        letter-spacing: 0.18em;
        font-weight: 600;
      }
      .svc-card h3 { margin-top: 8px; }
      .svc-card p { color: var(--muted); }
      .outcomes {
        list-style: none;
        padding: 0;
        margin: 0 0 var(--s-5);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .outcomes li {
        position: relative;
        padding-left: 22px;
        font-size: 0.93rem;
        color: var(--ink);
      }
      .outcomes li::before {
        content: '';
        position: absolute;
        top: 8px;
        left: 0;
        width: 12px;
        height: 2px;
        background: var(--gold);
      }

      /* PHILOSOPHY */
      .philo-grid {
        display: grid;
        grid-template-columns: 1.05fr 1fr;
        gap: 64px;
        align-items: center;
      }
      .philo-art {
        background: linear-gradient(135deg, var(--espresso-2), var(--espresso));
        border: 1px solid var(--line-on-dark);
        border-radius: var(--radius-xl);
        aspect-ratio: 4 / 3;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .barre { position: relative; width: 80%; height: 80%; }
      .barre-bar {
        position: absolute;
        top: 40%;
        left: 0; right: 0;
        height: 6px;
        background: var(--gold);
        border-radius: 4px;
        box-shadow: 0 4px 24px rgba(184, 144, 85, 0.4);
      }
      .barre-rail {
        position: absolute;
        top: 0; bottom: 0;
        left: 12%;
        width: 4px;
        background: rgba(245, 241, 235, 0.18);
        border-radius: 4px;
      }
      .barre-rail.two { left: auto; right: 12%; }
      .motto {
        position: absolute;
        bottom: 0;
        left: 0; right: 0;
        text-align: center;
        font-family: var(--font-serif);
        font-style: italic;
        color: rgba(245, 241, 235, 0.6);
        font-size: 1.05rem;
        letter-spacing: 0.12em;
      }

      /* CTA */
      .cta-band { padding: 64px 0; }
      .cta-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 32px;
      }
      .cta-actions { display: flex; gap: 12px; flex-wrap: wrap; }

      @media (max-width: 980px) {
        .hero-grid { grid-template-columns: 1fr; gap: 32px; }
        .hero-aside { order: -1; max-width: 520px; }
        .philo-grid { grid-template-columns: 1fr; gap: 32px; }
        .cta-inner { flex-direction: column; align-items: flex-start; }
      }
      @media (max-width: 640px) {
        .proof { grid-template-columns: 1fr; gap: 16px; }
        .logo-strip { gap: 16px; }
        .logo { font-size: 0.85rem; }
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  // Services come from the backend; testimonials and client logos remain
  // local fixtures because the backend doesn't expose listing endpoints for
  // them yet (the underlying tables exist — see prisma/schema.prisma — but
  // are not surfaced via REST in this milestone).
  services = signal<ServiceDto[]>([]);
  featured = TESTIMONIALS[0];
  logos = CLIENT_LOGOS;

  private jsonLd = inject(JsonLdService);
  private content = inject(ContentService);

  ngOnInit(): void {
    this.jsonLd.set([this.jsonLd.organization()]);
    this.content.listServices().subscribe({
      next: (res) => this.services.set(res.items),
      error: () => this.services.set([]),
    });
  }
}
