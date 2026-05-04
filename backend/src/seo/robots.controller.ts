import { Controller, Get, Header } from '@nestjs/common';

@Controller()
export class RobotsController {
  @Get('robots.txt')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  render(): string {
    const origin = (process.env.PUBLIC_SITE_ORIGIN ?? 'https://lebarregroup.com').replace(/\/$/, '');
    return [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /admin/',
      'Disallow: /api/admin',
      '',
      `Sitemap: ${origin}/sitemap.xml`,
      '',
    ].join('\n');
  }
}
