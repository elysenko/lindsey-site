import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Debug: Log that main.ts has loaded
console.log('Angular main.ts module loaded');

// Start bootstrap
bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log('Angular bootstrap successful');
    (window as any).__angularReady = true;
  })
  .catch((err) => {
    console.error('Angular bootstrap error:', err);
    const errorEl = document.getElementById('app-error');
    if (errorEl) {
      errorEl.textContent = 'Bootstrap error: ' + (err.message || String(err));
    }
  });
