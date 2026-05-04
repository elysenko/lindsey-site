import { Routes } from '@angular/router';
import { PublicShellComponent } from './components/public-shell.component';
import { adminRoleGuard, authGuard } from './services/auth.guards';

export const routes: Routes = [
  // Distraction-free routes (no global nav)
  {
    path: 'consult',
    loadComponent: () => import('./pages/consult.component').then((m) => m.ConsultComponent),
  },
  {
    path: 'consult/thank-you',
    loadComponent: () =>
      import('./pages/consult-thank-you.component').then((m) => m.ConsultThankYouComponent),
  },
  {
    path: 'brief/:token',
    loadComponent: () => import('./pages/brief.component').then((m) => m.BriefComponent),
  },

  // Admin routes (own shell)
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./pages/admin/admin-login.component').then((m) => m.AdminLoginComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'leads' },
      {
        path: 'leads',
        canActivate: [adminRoleGuard],
        loadComponent: () =>
          import('./pages/admin/admin-leads.component').then((m) => m.AdminLeadsComponent),
      },
      {
        path: 'leads/:id',
        canActivate: [adminRoleGuard],
        loadComponent: () =>
          import('./pages/admin/admin-lead-detail.component').then((m) => m.AdminLeadDetailComponent),
      },
      {
        path: 'insights',
        canActivate: [adminRoleGuard],
        loadComponent: () =>
          import('./pages/admin/admin-insights.component').then((m) => m.AdminInsightsComponent),
      },
      {
        path: 'insights/new',
        canActivate: [adminRoleGuard],
        loadComponent: () =>
          import('./pages/admin/admin-insight-editor.component').then(
            (m) => m.AdminInsightEditorComponent
          ),
      },
      {
        path: 'insights/:slug/edit',
        canActivate: [adminRoleGuard],
        loadComponent: () =>
          import('./pages/admin/admin-insight-editor.component').then(
            (m) => m.AdminInsightEditorComponent
          ),
      },
      {
        path: 'forbidden',
        loadComponent: () =>
          import('./pages/admin/admin-403.component').then((m) => m.Admin403Component),
      },
      {
        path: 'team',
        loadComponent: () =>
          import('./pages/admin/admin-403.component').then((m) => m.Admin403Component),
      },
    ],
  },

  // Public site routes (with header + footer shell)
  {
    path: '',
    component: PublicShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'services',
        loadComponent: () => import('./pages/services.component').then((m) => m.ServicesComponent),
      },
      {
        path: 'services/:slug',
        loadComponent: () =>
          import('./pages/service-detail.component').then((m) => m.ServiceDetailComponent),
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/about.component').then((m) => m.AboutComponent),
      },
      {
        path: 'team/:slug',
        loadComponent: () =>
          import('./pages/team-member.component').then((m) => m.TeamMemberComponent),
      },
      {
        path: 'faq',
        loadComponent: () => import('./pages/faq.component').then((m) => m.FaqComponent),
      },
      {
        path: 'insights',
        loadComponent: () => import('./pages/insights.component').then((m) => m.InsightsComponent),
      },
      {
        path: 'insights/:slug',
        loadComponent: () =>
          import('./pages/insight-post.component').then((m) => m.InsightPostComponent),
      },
      {
        path: '**',
        loadComponent: () => import('./pages/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },
];
