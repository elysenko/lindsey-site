import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-403',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="forbidden">
      <span class="badge warn">403 — Forbidden</span>
      <h1>You do not have permission to view this page.</h1>
      <p class="muted">Your account does not carry the admin role required for this area. If you believe this is an error, contact a partner.</p>
      <div class="row">
        <a routerLink="/" class="btn btn-dark">Return to site</a>
        <a routerLink="/admin/login" class="btn btn-outline">Sign in as another user</a>
      </div>
    </section>
  `,
  styles: [
    `
      .forbidden {
        max-width: 560px;
        margin: 96px auto;
        text-align: center;
        padding: var(--s-7);
      }
      .row { display: flex; gap: 12px; justify-content: center; margin-top: var(--s-5); flex-wrap: wrap; }
    `,
  ],
})
export class Admin403Component {}
