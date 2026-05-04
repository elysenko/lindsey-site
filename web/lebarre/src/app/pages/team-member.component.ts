import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentService } from '../services/content.service';
import { TeamMemberDetailDto } from '../services/api-types';
import { ApiError } from '../services/http-error';
import { StructuredDataService } from '../services/structured-data.service';
import { JsonLdService } from '../services/json-ld.service';

@Component({
  selector: 'app-team-member',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (loading()) {
    <section class="section text-center"><div class="container"><p class="muted">Loading profile…</p></div></section>
    } @else if (notFound()) {
    <section class="section text-center">
      <div class="container">
        <h1>Profile not found.</h1>
        <a routerLink="/about" class="btn btn-outline">Meet the team</a>
      </div>
    </section>
    } @else if (member()) {
    @let m = member()!;
    <section class="page-head section-bone">
      <div class="container">
        <nav class="crumbs">
          <a routerLink="/">Home</a> /
          <a routerLink="/about">About</a> /
          <span>{{ m.fullName }}</span>
        </nav>
      </div>
    </section>

    <section class="section">
      <div class="container profile-grid">
        <aside class="profile-side">
          <div class="headshot" [style.background-image]="m.headshotUrl ? 'url(' + m.headshotUrl + ')' : null">
            @if (!m.headshotUrl) { <span>{{ initialsFor(m.fullName) }}</span> }
          </div>
          <h1>{{ m.honorificPrefix }} {{ m.fullName }}</h1>
          <p class="role">{{ m.title }}</p>
          @if (m.credentials?.length) {
          <p class="creds muted">{{ m.credentials.join(' · ') }}</p>
          }

          @if (m.professionalLinks?.length || m.linkedinUrl) {
          <h4 class="sub">Connect</h4>
          <ul class="links">
            @if (m.linkedinUrl) {
            <li><a [href]="m.linkedinUrl" target="_blank" rel="noopener noreferrer">LinkedIn →</a></li>
            }
            @for (l of m.professionalLinks || []; track l.url) {
            <li>
              @if (l.url.startsWith('/')) {
              <a [routerLink]="l.url">{{ l.label }} →</a>
              } @else {
              <a [href]="l.url" target="_blank" rel="noopener noreferrer">{{ l.label }} →</a>
              }
            </li>
            }
          </ul>
          }
        </aside>

        <div class="profile-body">
          <span class="eyebrow">Biography</span>
          <p class="lede">{{ m.bio }}</p>

          @if (m.expertise?.length) {
          <h2>Areas of expertise</h2>
          <ul class="pillset">
            @for (e of m.expertise; track e) { <li class="badge gold">{{ e }}</li> }
          </ul>
          }

          @if (m.certifications?.length) {
          <h2 class="mt-6">Certifications</h2>
          <ul class="bulleted">
            @for (c of m.certifications; track c) { <li>{{ c }}</li> }
          </ul>
          }

          @if (m.education?.length) {
          <h2 class="mt-6">Education</h2>
          <ul class="bulleted">
            @for (ed of m.education; track ed.degree) {
            <li><strong>{{ ed.degree }}</strong> — {{ ed.institution }}</li>
            }
          </ul>
          }

          <div class="cta-strip">
            <a routerLink="/consult" class="btn btn-dark">Request a consultation</a>
            <a routerLink="/insights" class="btn btn-ghost">Read the team's writing →</a>
          </div>
        </div>
      </div>
    </section>
    }
  `,
  styles: [
    `
      .page-head { padding: 32px 0 16px; }
      .crumbs { font-size: 0.85rem; color: var(--muted); }
      .crumbs a { color: var(--muted); }

      .profile-grid {
        display: grid;
        grid-template-columns: 320px 1fr;
        gap: 64px;
        align-items: start;
      }
      .profile-side {
        position: sticky;
        top: 96px;
        background: #fff;
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        padding: var(--s-6);
        box-shadow: var(--shadow-sm);
      }
      .headshot {
        aspect-ratio: 1;
        max-width: 200px;
        margin: 0 auto var(--s-5);
        border-radius: 50%;
        background: linear-gradient(135deg, var(--espresso), var(--espresso-3));
        background-size: cover;
        background-position: center;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-serif);
        font-size: 4rem;
        font-weight: 600;
        color: var(--gold-light);
      }
      .profile-side h1 {
        font-size: 1.5rem;
        margin-bottom: 4px;
        text-align: center;
      }
      .role { text-align: center; color: var(--gold-dark); font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; font-size: 0.85rem; margin: 0 0 4px; }
      .creds { text-align: center; font-size: 0.9rem; margin: 0 0 var(--s-5); }
      .sub {
        font-size: 0.78rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: var(--gold-dark);
        margin: var(--s-4) 0 8px;
        text-align: left;
      }
      .links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }

      .profile-body .lede {
        font-family: var(--font-serif);
        font-size: 1.3rem;
        line-height: 1.5;
        color: var(--ink);
        margin: 8px 0 var(--s-7);
      }
      .pillset {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        list-style: none;
        padding: 0;
        margin: 0 0 var(--s-5);
      }
      .bulleted {
        list-style: none;
        padding: 0;
        margin: 0 0 var(--s-5);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .bulleted li {
        position: relative;
        padding-left: 20px;
      }
      .bulleted li::before {
        content: '';
        position: absolute;
        top: 9px;
        left: 0;
        width: 10px;
        height: 2px;
        background: var(--gold);
      }
      .mt-6 { margin-top: var(--s-7); }

      .cta-strip {
        display: flex;
        gap: 12px;
        margin-top: var(--s-7);
        padding-top: var(--s-5);
        border-top: 1px solid var(--line);
        flex-wrap: wrap;
      }

      @media (max-width: 980px) {
        .profile-grid { grid-template-columns: 1fr; gap: 32px; }
        .profile-side { position: static; }
      }
    `,
  ],
})
export class TeamMemberComponent implements OnInit {
  member = signal<TeamMemberDetailDto | null>(null);
  loading = signal(true);
  notFound = signal(false);

  private readonly route = inject(ActivatedRoute);
  private readonly content = inject(ContentService);
  private readonly structured = inject(StructuredDataService);
  private readonly jsonLd = inject(JsonLdService);

  ngOnInit(): void {
    this.route.paramMap.subscribe((p) => this.load(p.get('slug') ?? ''));
  }

  private load(slug: string): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.content.getTeamMember(slug).subscribe({
      next: (res) => {
        this.member.set(res.member);
        this.structured.set([
          this.jsonLd.organization(),
          res.jsonLd?.person,
          res.jsonLd?.breadcrumbs,
        ]);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.loading.set(false);
        if (err.kind === 'not-found') this.notFound.set(true);
        else this.notFound.set(true);
      },
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
