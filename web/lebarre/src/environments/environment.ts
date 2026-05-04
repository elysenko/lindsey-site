export const environment = {
  production: false,
  // Empty string means same-origin requests; the backend is mounted at /api/*
  // by the NestJS server. In production this will be served behind the same
  // ingress as the SPA so relative URLs work.
  apiBaseUrl: '',
};
