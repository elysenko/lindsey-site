import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BrandMarkComponent } from './brand-mark.component';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, BrandMarkComponent],
  template: `
    <header class="site-header" [class.scrolled]="scrolled()">
      <div class="container header-inner">
        <a routerLink="/" class="brand-link" aria-label="The LeBarre Group home">
          <app-brand-mark [showTagline]="false"></app-brand-mark>
        </a>

        <nav class="nav-desktop" aria-label="Primary">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
          <a routerLink="/services" routerLinkActive="active">Services</a>
          <a routerLink="/about" routerLinkActive="active">About</a>
          <a routerLink="/insights" routerLinkActive="active">Insights</a>
          <a routerLink="/faq" routerLinkActive="active">FAQ</a>
        </nav>

        <div class="header-cta">
          <a routerLink="/consult" class="btn btn-dark">Request a Consultation</a>
        </div>

        <button
          type="button"
          class="hamburger"
          (click)="toggle()"
          [attr.aria-expanded]="open()"
          aria-label="Open menu"
          aria-controls="mobile-menu">
          <span [class.open]="open()"></span>
          <span [class.open]="open()"></span>
          <span [class.open]="open()"></span>
        </button>
      </div>

      <div id="mobile-menu" class="nav-mobile" [class.open]="open()">
        <nav aria-label="Mobile">
          <a routerLink="/" (click)="close()" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
          <a routerLink="/services" (click)="close()" routerLinkActive="active">Services</a>
          <a routerLink="/about" (click)="close()" routerLinkActive="active">About</a>
          <a routerLink="/insights" (click)="close()" routerLinkActive="active">Insights</a>
          <a routerLink="/faq" (click)="close()" routerLinkActive="active">FAQ</a>
          <a routerLink="/consult" (click)="close()" class="cta">Request a Consultation</a>
        </nav>
      </div>
    </header>
  `,
  styles: [
    `
      .site-header {
        position: sticky;
        top: 0;
        z-index: 60;
        background: rgba(245, 241, 235, 0.92);
        backdrop-filter: saturate(140%) blur(8px);
        -webkit-backdrop-filter: saturate(140%) blur(8px);
        border-bottom: 1px solid var(--line);
        transition: background 0.2s ease, border-color 0.2s ease;
      }
      .site-header.scrolled {
        background: rgba(245, 241, 235, 0.98);
      }
      .header-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        padding-top: 14px;
        padding-bottom: 14px;
      }
      .brand-link {
        display: flex;
        align-items: center;
        text-decoration: none;
        color: inherit;
      }
      .nav-desktop {
        display: flex;
        align-items: center;
        gap: 28px;
        font-weight: 500;
        font-size: 0.95rem;
      }
      .nav-desktop a {
        color: var(--espresso);
        position: relative;
        padding: 6px 0;
        transition: color 0.15s ease;
      }
      .nav-desktop a:hover { color: var(--gold-dark); }
      .nav-desktop a.active::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: -4px;
        height: 2px;
        background: var(--gold);
        border-radius: 2px;
      }
      .header-cta { display: flex; }
      .hamburger {
        display: none;
        background: transparent;
        border: 1px solid var(--line);
        border-radius: 8px;
        width: 44px;
        height: 44px;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        cursor: pointer;
        padding: 0;
      }
      .hamburger span {
        width: 22px;
        height: 2px;
        background: var(--espresso);
        border-radius: 2px;
        transition: transform 0.2s ease, opacity 0.2s ease;
        display: block;
      }
      .hamburger span.open:nth-child(1) {
        transform: translateY(6px) rotate(45deg);
      }
      .hamburger span.open:nth-child(2) { opacity: 0; }
      .hamburger span.open:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

      .nav-mobile {
        display: none;
        background: var(--bone);
        border-bottom: 1px solid var(--line);
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.25s ease;
      }
      .nav-mobile.open {
        display: block;
        max-height: 500px;
      }
      .nav-mobile nav {
        display: flex;
        flex-direction: column;
        padding: 8px var(--s-4) 16px;
      }
      .nav-mobile a {
        display: flex;
        align-items: center;
        min-height: 48px;
        padding: 8px 12px;
        color: var(--espresso);
        border-bottom: 1px solid var(--line);
        font-size: 1rem;
        font-weight: 500;
      }
      .nav-mobile a:active { background: var(--bone-2); }
      .nav-mobile a.cta {
        margin-top: 8px;
        background: var(--espresso);
        color: var(--bone);
        border-radius: 999px;
        justify-content: center;
        border: 0;
        font-weight: 600;
      }
      .nav-mobile a.active { color: var(--gold-dark); }

      @media (max-width: 920px) {
        .nav-desktop { display: none; }
        .header-cta { display: none; }
        .hamburger { display: inline-flex; }
      }
    `,
  ],
})
export class SiteHeaderComponent {
  open = signal(false);
  scrolled = signal(false);

  toggle(): void { this.open.update((v) => !v); }
  close(): void { this.open.set(false); }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }
}
