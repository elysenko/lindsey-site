import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="section text-center" style="padding: 96px 0;">
      <div class="container">
        <span class="eyebrow">404 — Page not found</span>
        <h1>That page no longer exists.</h1>
        <p class="muted">It may have moved or been retired. The links below should help.</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:32px;">
          <a routerLink="/" class="btn btn-dark">Return home</a>
          <a routerLink="/services" class="btn btn-outline">Explore services</a>
          <a routerLink="/consult" class="btn btn-ghost">Request a consultation →</a>
        </div>
      </div>
    </section>
  `,
})
export class NotFoundComponent {}
