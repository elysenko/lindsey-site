import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeaderComponent } from './site-header.component';
import { SiteFooterComponent } from './site-footer.component';

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [RouterOutlet, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <div class="page-shell">
      <app-site-header></app-site-header>
      <main>
        <router-outlet></router-outlet>
      </main>
      <app-site-footer></app-site-footer>
    </div>
  `,
})
export class PublicShellComponent {}
