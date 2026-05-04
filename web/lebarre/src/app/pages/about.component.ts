import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../services/content.service';
import { TeamMemberSummaryDto } from '../services/api-types';
import { JsonLdService } from '../services/json-ld.service';
import { StructuredDataService } from '../services/structured-data.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-head section-bone">
      <div class="container">
        <nav class="crumbs"><a routerLink="/">Home</a> / <span>About</span></nav>
        <span class="eyebrow">About</span>
        <h1>Built in rehearsal.<br />Performed at scale.</h1>
        <p class="lead muted">
          The LeBarre Group was founded in 2014 on a single conviction: the best
          crisis response is the rehearsal that already happened. A decade later,
          that conviction shapes every engagement we run.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container narrative">
        <div class="grid grid-2">
          <div>
            <span class="eyebrow">Founding story</span>
            <h2>From inside the room.</h2>
            <p>
              Eleanor LeBarre founded the firm after fifteen years inside Fortune 500
              communications and a major academic medical center, where she watched an
              uncomfortable pattern repeat itself: organizations with detailed crisis
              binders folded under load, while organizations with rehearsed teams held
              the line.
            </p>
            <p>
              The first three engagements of The LeBarre Group were all rehearsals —
              not crises. By 2018 the firm had counseled boards through more than thirty
              active matters. By 2024 we had grown to four practice areas, kept the
              senior-partner-on-every-engagement rule intact, and never lost the
              conviction that brought us here: preparation that performs.
            </p>
          </div>
          <div>
            <span class="eyebrow">Methodology</span>
            <h2 class="serif gold-em-h">Back to the barre.</h2>
            <p>
              In ballet, the barre is where excellence is built — slowly,
              deliberately, in repeat. We borrowed the metaphor on purpose.
              Crisis response is performance. Reputation is performance. The
              calm we deliver in the moment is built somewhere else, earlier,
              in repetition.
            </p>
            <p>
              "Back to the barre" describes the cadence of every engagement we run.
              Ground in research. Drill in rehearsal. Perform when it counts.
              Return to the barre to refine. Calm is not a temperament. It is a
              habit, learned in rehearsal.
            </p>
          </div>
        </div>

        <div class="values mt-8">
          <h3 class="text-center">Four convictions that govern the work</h3>
          <hr class="gold-rule center" />
          <div class="grid grid-4 values-grid">
            <div class="value-card">
              <span class="num">01</span>
              <h4>Senior partner on every call</h4>
              <p>No outsourcing of judgment. The person on the line is the person who has done this before.</p>
            </div>
            <div class="value-card">
              <span class="num">02</span>
              <h4>Rehearsal is the deliverable</h4>
              <p>The binder is an artifact. The capability is what saves you. We invest in capability.</p>
            </div>
            <div class="value-card">
              <span class="num">03</span>
              <h4>Measurement is mandatory</h4>
              <p>Every quarter ends with a scorecard. Reputation behaves like an asset; we manage it like one.</p>
            </div>
            <div class="value-card">
              <span class="num">04</span>
              <h4>Privilege is sacred</h4>
              <p>Tri-lateral counsel with the client, outside lawyers, and us. Documentation tight. Privilege intact.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section section-bone">
      <div class="container">
        <header class="section-head">
          <span class="eyebrow">The team</span>
          <h2>Senior counsel, hands on the work.</h2>
          <p class="lead muted">Every engagement is led by a partner who has been in the room before.</p>
        </header>

        @if (team().length === 0) {
        <p class="muted">Loading team profiles…</p>
        } @else {
        <div class="grid team-grid">
          @for (m of team(); track m.slug) {
          <a [routerLink]="['/team', m.slug]" class="team-card">
            <div class="avatar" [style.background-image]="m.headshotUrl ? 'url(' + m.headshotUrl + ')' : null">
              @if (!m.headshotUrl) { {{ initialsFor(m.fullName) }} }
            </div>
            <div class="team-body">
              <h3>{{ m.honorificPrefix }} {{ m.fullName }}@if (m.credentials?.length) {<span class="post">, {{ m.credentials.join(', ') }}</span>}</h3>
              <p class="role">{{ m.title }}</p>
              <span class="link-arrow">View profile</span>
            </div>
          </a>
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
      .lead { max-width: 64ch; }

      .gold-em-h::after { content: ''; display: block; width: 56px; height: 3px; background: var(--gold); margin-top: 8px; }

      .narrative .eyebrow { display: block; }
      .values { margin-top: var(--s-9); padding-top: var(--s-7); border-top: 1px solid var(--line); }
      .values-grid { gap: 20px; margin-top: var(--s-6); }
      .value-card {
        background: #fff;
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        padding: var(--s-6);
      }
      .value-card .num {
        font-family: var(--font-serif);
        color: var(--gold);
        font-size: 1.25rem;
        font-weight: 600;
        letter-spacing: 0.1em;
      }
      .value-card h4 { margin: 8px 0 8px; font-family: var(--font-serif); font-weight: 600; font-size: 1.2rem; }
      .value-card p { font-size: 0.95rem; color: var(--muted); margin: 0; }

      .team-grid {
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
      .team-card {
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: 24px;
        align-items: start;
        background: #fff;
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        padding: var(--s-6);
        text-decoration: none;
        color: inherit;
        transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
      }
      .team-card:hover {
        border-color: var(--gold);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
      .avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--espresso), var(--espresso-3));
        background-size: cover;
        background-position: center;
        color: var(--gold-light);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-serif);
        font-size: 2rem;
        font-weight: 600;
        letter-spacing: 0.04em;
      }
      .team-body h3 {
        font-size: 1.2rem;
        margin-bottom: 4px;
      }
      .team-body h3 .post { color: var(--muted); font-weight: 400; font-size: 0.92rem; }
      .role { font-size: 0.95rem; color: var(--gold-dark); margin: 0 0 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
      .bio-snip { font-size: 0.95rem; color: var(--ink); }

      @media (max-width: 900px) {
        .team-grid { grid-template-columns: 1fr; }
      }
      @media (max-width: 540px) {
        .team-card { grid-template-columns: 1fr; gap: 16px; }
        .avatar { width: 72px; height: 72px; font-size: 1.5rem; }
      }
    `,
  ],
})
export class AboutComponent implements OnInit {
  team = signal<TeamMemberSummaryDto[]>([]);

  private jsonLd = inject(JsonLdService);
  private structured = inject(StructuredDataService);
  private content = inject(ContentService);

  ngOnInit(): void {
    this.structured.set([
      this.jsonLd.organization(),
      this.jsonLd.breadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'About', url: '/about' },
      ]),
    ]);
    this.content.listTeam().subscribe({
      next: (members) => this.team.set(members),
      // Failure here is non-fatal — the page still renders the rest.
      error: () => this.team.set([]),
    });
  }

  initialsFor(name: string): string {
    return name
      .split(' ')
      .map((p) => p.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
