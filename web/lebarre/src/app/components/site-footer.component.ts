import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BrandMarkComponent } from './brand-mark.component';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, BrandMarkComponent],
  template: `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-brand">
          <app-brand-mark [dark]="true"></app-brand-mark>
          <p class="muted-light mt-4">
            Crisis communications, reputation, and AI-enhanced intelligence
            for executives and institutions. Preparation that performs.
          </p>
          <div class="contact mt-4">
            <p><a href="mailto:hello@lebarregroup.example">hello&#64;lebarregroup.example</a></p>
            <p><a href="tel:+12025550140">+1 (202) 555-0140</a></p>
            <p>1100 Connecticut Ave NW, Washington DC 20036</p>
          </div>
        </div>

        <div class="footer-col">
          <h4>Services</h4>
          <ul>
            <li><a routerLink="/services/crisis-communications">Crisis Communications</a></li>
            <li><a routerLink="/services/reputation-management">Reputation Management</a></li>
            <li><a routerLink="/services/ai-enhanced-monitoring">AI-Enhanced Monitoring</a></li>
            <li><a routerLink="/services/email-social-strategy">Email &amp; Social Strategy</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Firm</h4>
          <ul>
            <li><a routerLink="/about">About</a></li>
            <li><a routerLink="/insights">Insights</a></li>
            <li><a routerLink="/faq">FAQ</a></li>
            <li><a routerLink="/consult">Request a Consultation</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Connect</h4>
          <ul class="social">
            <li><a href="https://linkedin.com/company/the-lebarre-group" target="_blank" rel="noopener">LinkedIn</a></li>
            <li><a href="https://twitter.com/lebarregroup" target="_blank" rel="noopener">X / Twitter</a></li>
            <li><a href="https://instagram.com/lebarregroup" target="_blank" rel="noopener">Instagram</a></li>
            <li><a routerLink="/admin/login">Admin</a></li>
          </ul>
        </div>
      </div>

      <div class="container footer-base">
        <p>© {{ year }} The LeBarre Group, LLC. All rights reserved.</p>
        <p class="legal">Site by The LeBarre Group · Privacy · Terms</p>
      </div>
    </footer>
  `,
  styles: [
    `
      .site-footer {
        background: var(--espresso);
        color: var(--bone);
        padding: 64px 0 24px;
        margin-top: auto;
      }
      .footer-grid {
        display: grid;
        grid-template-columns: 1.4fr 1fr 1fr 1fr;
        gap: 48px;
      }
      .footer-brand p { color: rgba(245, 241, 235, 0.78); }
      .muted-light { color: rgba(245, 241, 235, 0.78); }
      .contact p { margin: 0 0 6px; font-size: 0.92rem; color: rgba(245, 241, 235, 0.78); }
      .contact a { color: rgba(245, 241, 235, 0.92); }
      .contact a:hover { color: var(--gold-light); }

      .footer-col h4 {
        color: var(--bone);
        font-family: var(--font-sans);
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        margin: 0 0 16px;
      }
      .footer-col ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .footer-col a {
        color: rgba(245, 241, 235, 0.78);
        font-size: 0.95rem;
      }
      .footer-col a:hover { color: var(--gold-light); }

      .footer-base {
        margin-top: 48px;
        padding-top: 24px;
        border-top: 1px solid var(--line-on-dark);
        display: flex;
        justify-content: space-between;
        font-size: 0.85rem;
        color: rgba(245, 241, 235, 0.6);
      }
      .footer-base p { margin: 0; }

      @media (max-width: 900px) {
        .footer-grid {
          grid-template-columns: 1fr 1fr;
          gap: 36px;
        }
      }
      @media (max-width: 560px) {
        .footer-grid { grid-template-columns: 1fr; gap: 28px; }
        .footer-base { flex-direction: column; gap: 8px; }
      }
    `,
  ],
})
export class SiteFooterComponent {
  year = new Date().getFullYear();
}
