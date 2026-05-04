import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Capture per-request latency. We expose a short rolling histogram in-process
 * so the deployment health probe can spot p95 regressions without an external
 * metrics backend. Form-submission endpoints have a 1000ms p95 target
 * (see backend/README.md) — when those are exceeded, this middleware logs a
 * warning so it shows up in container logs / Loki.
 */
@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Metrics');

  // Per-route ring buffer of recent durations (last 200 samples). Keeps memory
  // bounded; sufficient to surface p95 in operational logs.
  private readonly samples = new Map<string, number[]>();
  private static readonly WINDOW = 200;
  private static readonly SLO_PATHS: { test: (path: string) => boolean; budgetMs: number }[] = [
    { test: (p) => p === '/api/consultations' || /^\/api\/brief\/[^/]+$/.test(p), budgetMs: 1000 },
  ];

  use(req: Request, res: Response, next: NextFunction): void {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const durMs = Number(process.hrtime.bigint() - start) / 1e6;
      const key = `${req.method} ${req.route?.path ?? req.path}`;
      const buf = this.samples.get(key) ?? [];
      buf.push(durMs);
      if (buf.length > MetricsMiddleware.WINDOW) buf.shift();
      this.samples.set(key, buf);

      const slo = MetricsMiddleware.SLO_PATHS.find((s) => s.test(req.path));
      if (slo && durMs > slo.budgetMs) {
        this.logger.warn(
          `SLO breach: ${req.method} ${req.path} took ${durMs.toFixed(0)}ms (budget ${slo.budgetMs}ms)`,
        );
      }
    });
    next();
  }

  /**
   * p95 across the rolling window for a route key — exposed for tests /
   * future Prometheus exporters. Returns null if no samples yet.
   */
  p95(routeKey: string): number | null {
    const buf = this.samples.get(routeKey);
    if (!buf || buf.length === 0) return null;
    const sorted = [...buf].sort((a, b) => a - b);
    const idx = Math.floor(sorted.length * 0.95);
    return sorted[Math.min(idx, sorted.length - 1)];
  }
}
