import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-brand-mark',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="brand-mark" [class.dark]="dark" [class.compact]="compact" [class.full-logo]="fullLogo">
      @if (fullLogo) {
        <img
          src="lebarre-logo.jpg"
          alt="The LeBarre Group - Crisis Communications & Strategy"
          class="logo-image"
          width="1080"
          height="1080" />
      } @else {
        <img
          src="lebarre-logo.jpg"
          alt="The LeBarre Group"
          class="logo-icon"
          width="1080"
          height="1080" />
      }
    </span>
  `,
  styles: [
    `
      .brand-mark {
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        color: inherit;
      }
      /* Header logo: display with correct aspect ratio */
      .logo-icon {
        width: auto;
        height: 52px;
        flex: 0 0 auto;
        object-fit: contain;
        object-position: center;
      }
      .compact .logo-icon {
        height: 44px;
      }
      /* Full logo for hero/footer: larger display preserving aspect ratio */
      .full-logo .logo-image {
        width: auto;
        max-width: 320px;
        height: auto;
        max-height: 220px;
        object-fit: contain;
        object-position: center;
      }
      @media (max-width: 768px) {
        .logo-icon {
          height: 44px;
        }
        .compact .logo-icon {
          height: 36px;
        }
        .full-logo .logo-image {
          max-width: 260px;
          max-height: 180px;
        }
      }
    `,
  ],
})
export class BrandMarkComponent {
  @Input() dark = false;
  @Input() compact = false;
  @Input() showTagline = true;
  @Input() fullLogo = false;
}
