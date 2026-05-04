import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BrandMarkComponent } from '../../components/brand-mark.component';
import { AuthService } from '../../services/auth.service';
import { ApiError } from '../../services/http-error';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BrandMarkComponent],
  template: `
    <div class="login-page">
      <div class="login-shell">
        <a routerLink="/" class="brand-link"><app-brand-mark></app-brand-mark></a>
        <h1>Admin sign in</h1>
        <p class="muted">For LeBarre Group team members.</p>

        <form (submit)="onSubmit($event)" novalidate>
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" name="email" [(ngModel)]="email" autocomplete="email" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" name="password" [(ngModel)]="password" autocomplete="current-password" />
          </div>

          @if (error()) {
          <div class="error-banner" role="alert">
            {{ error() }}
          </div>
          }
          @if (lockedOut()) {
          <div class="error-banner" role="alert">
            Too many failed attempts. We have locked the account temporarily and sent a password reset link to your registered email.
          </div>
          }

          <button type="submit" class="btn btn-dark btn-block" [disabled]="lockedOut() || submitting()">
            {{ submitting() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <div class="alt">
          <a href="#">Forgot password?</a>
          <a routerLink="/">← Back to site</a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-page {
        min-height: 100vh;
        min-height: 100svh;
        background: linear-gradient(180deg, var(--espresso) 0%, var(--espresso-2) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--s-5);
      }
      .login-shell {
        width: 100%;
        max-width: 420px;
        background: var(--bone);
        padding: var(--s-7);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
      }
      .brand-link { display: inline-flex; margin-bottom: var(--s-5); text-decoration: none; }
      h1 { margin-bottom: 4px; font-size: 1.6rem; }
      .alt {
        display: flex;
        justify-content: space-between;
        margin-top: var(--s-4);
        font-size: 0.9rem;
      }
      .alt a { color: var(--gold-dark); }
      .error-banner {
        background: rgba(178, 58, 58, 0.1);
        color: var(--error);
        border-radius: var(--radius-md);
        padding: 12px 14px;
        font-size: 0.9rem;
        margin-bottom: var(--s-4);
        line-height: 1.4;
      }
    `,
  ],
})
export class AdminLoginComponent {
  email = '';
  password = '';
  error = signal<string | null>(null);
  lockedOut = signal(false);
  submitting = signal(false);

  private auth = inject(AuthService);
  private router = inject(Router);

  onSubmit(ev: Event): void {
    ev.preventDefault();
    if (this.submitting() || this.lockedOut()) return;
    if (!this.email || !this.password) {
      this.error.set('Please enter your email and password.');
      return;
    }
    this.submitting.set(true);
    this.error.set(null);

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.submitting.set(false);
        // Backend role gate (AdminGuard) will catch non-admin users on the
        // first protected request; the route guard also enforces this.
        this.router.navigate(['/admin/leads']);
      },
      error: (errRaw) => {
        this.submitting.set(false);
        const err = errRaw instanceof ApiError ? errRaw : null;
        if (err?.kind === 'rate-limited') {
          // Brute-force lockout: backend returns 429 + dispatches reset email.
          this.lockedOut.set(true);
          this.error.set(null);
          return;
        }
        if (err?.kind === 'unauthorized') {
          this.error.set('Invalid email or password.');
          return;
        }
        if (err?.kind === 'network') {
          this.error.set(err.message);
          return;
        }
        this.error.set(err?.message || 'Could not sign in. Please try again.');
      },
    });
  }
}
