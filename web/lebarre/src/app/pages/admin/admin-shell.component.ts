import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BrandMarkComponent } from '../../components/brand-mark.component';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, BrandMarkComponent],
  template: `
    <div class="admin-shell">
      <aside class="admin-side" [class.open]="navOpen()">
        <div class="side-brand">
          <app-brand-mark [showTagline]="false"></app-brand-mark>
          <span class="badge dark">Admin</span>
        </div>
        <nav class="side-nav">
          <a routerLink="/admin/leads" routerLinkActive="active">
            <span class="ico" aria-hidden="true">◇</span> Leads
          </a>
          <a routerLink="/admin/insights" routerLinkActive="active">
            <span class="ico" aria-hidden="true">▤</span> Insights
          </a>
          <a routerLink="/admin/team" routerLinkActive="active">
            <span class="ico" aria-hidden="true">◈</span> Team
          </a>
        </nav>
        <div class="side-foot">
          <div class="user-card">
            <span class="user-avatar">{{ initials() }}</span>
            <span>
              <strong>{{ auth.email() }}</strong>
              <span class="role">Admin</span>
            </span>
          </div>
          <button class="btn btn-outline btn-block" (click)="signOut()">Sign out</button>
        </div>
      </aside>

      <div class="admin-main">
        <header class="admin-bar">
          <button class="hamburger" (click)="toggleNav()" aria-label="Toggle navigation">
            <span></span><span></span><span></span>
          </button>
          <div class="bar-spacer"></div>
          <a routerLink="/" class="bar-link">View site →</a>
        </header>
        <div class="admin-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-shell {
        min-height: 100vh;
        min-height: 100svh;
        display: grid;
        grid-template-columns: 260px 1fr;
        background: var(--bone-2);
      }
      .admin-side {
        background: var(--espresso);
        color: var(--bone);
        padding: var(--s-5);
        display: flex;
        flex-direction: column;
        gap: var(--s-5);
        position: sticky;
        top: 0;
        height: 100vh;
        height: 100svh;
        overflow-y: auto;
        overscroll-behavior-y: contain;
      }
      .side-brand { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      ::ng-deep .admin-side .brand-name { color: var(--bone) !important; }
      ::ng-deep .admin-side .brand-sub { color: var(--gold-light) !important; }

      .side-nav { display: flex; flex-direction: column; gap: 6px; flex: 1; }
      .side-nav a {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border-radius: 8px;
        color: rgba(245, 241, 235, 0.78);
        font-size: 0.95rem;
        font-weight: 500;
        min-height: 44px;
      }
      .side-nav a:hover { background: rgba(245, 241, 235, 0.06); color: var(--bone); }
      .side-nav a.active { background: var(--gold); color: var(--espresso); }
      .side-nav .ico { color: var(--gold); width: 20px; text-align: center; }
      .side-nav a.active .ico { color: var(--espresso); }

      .side-foot { border-top: 1px solid var(--line-on-dark); padding-top: var(--s-4); display: flex; flex-direction: column; gap: 12px; }
      .user-card { display: flex; align-items: center; gap: 12px; }
      .user-avatar {
        width: 40px; height: 40px;
        border-radius: 50%;
        background: var(--gold);
        color: var(--espresso);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-serif);
        font-weight: 600;
      }
      .user-card strong { color: var(--bone); display: block; font-size: 0.92rem; }
      .role { display: block; font-size: 0.78rem; color: rgba(245, 241, 235, 0.6); text-transform: uppercase; letter-spacing: 0.1em; }
      .side-foot .btn-outline { color: var(--bone); border-color: rgba(245, 241, 235, 0.4); }
      .side-foot .btn-outline:hover { background: var(--bone); color: var(--espresso); }

      .admin-main { display: flex; flex-direction: column; min-width: 0; }
      .admin-bar {
        background: #fff;
        border-bottom: 1px solid var(--line);
        padding: 12px 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        position: sticky;
        top: 0;
        z-index: 20;
      }
      .bar-spacer { flex: 1; }
      .bar-link { font-size: 0.9rem; font-weight: 600; color: var(--gold-dark); }
      .hamburger {
        display: none;
        width: 44px; height: 44px;
        border: 1px solid var(--line);
        background: transparent;
        border-radius: 8px;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 0;
        cursor: pointer;
      }
      .hamburger span { width: 22px; height: 2px; background: var(--espresso); display: block; }

      .admin-content { padding: var(--s-6) var(--s-6); flex: 1; }

      @media (max-width: 980px) {
        .admin-shell { grid-template-columns: 1fr; }
        .admin-side {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 280px;
          z-index: 50;
          transform: translateX(-100%);
          transition: transform 0.25s ease;
          height: 100vh;
        }
        .admin-side.open { transform: translateX(0); }
        .hamburger { display: inline-flex; }
      }
      @media (max-width: 640px) {
        .admin-content { padding: var(--s-4); }
      }
    `,
  ],
})
export class AdminShellComponent implements OnInit {
  navOpen = signal(false);
  auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (!this.auth.signedIn()) {
      this.router.navigate(['/admin/login']);
    }
  }

  toggleNav(): void { this.navOpen.update((v) => !v); }

  initials(): string {
    const e = this.auth.email() || '';
    const initial = e.charAt(0).toUpperCase();
    return initial || 'A';
  }

  signOut(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/admin/login']),
      error: () => this.router.navigate(['/admin/login']),
    });
  }
}
