import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface JsonLdNode { [k: string]: any; }

@Injectable({ providedIn: 'root' })
export class JsonLdService {
  private isBrowser: boolean;
  private active = signal<JsonLdNode[]>([]);
  private nodeId = 'app-jsonld';

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  set(nodes: JsonLdNode[]): void {
    this.active.set(nodes);
    if (!this.isBrowser) return;
    const existing = document.getElementById(this.nodeId);
    if (existing) existing.remove();
    if (!nodes.length) return;
    const script = document.createElement('script');
    script.id = this.nodeId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(nodes.length === 1 ? nodes[0] : nodes);
    document.head.appendChild(script);
  }

  organization(): JsonLdNode {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'The LeBarre Group',
      legalName: 'The LeBarre Group, LLC',
      url: 'https://lebarregroup.example',
      logo: 'https://lebarregroup.example/assets/lebarre-logo.svg',
      description: 'Crisis communications, reputation management, AI-enhanced monitoring, and owned-channel strategy for executives, boards, and institutions.',
      foundingDate: '2014',
      sameAs: [
        'https://www.linkedin.com/company/the-lebarre-group',
        'https://twitter.com/lebarregroup',
        'https://www.instagram.com/lebarregroup',
      ],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'consultation',
          email: 'hello@lebarregroup.example',
          telephone: '+1-202-555-0140',
          areaServed: 'US',
          availableLanguage: ['English'],
        },
      ],
    };
  }

  breadcrumbs(items: { name: string; url: string }[]): JsonLdNode {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        item: `https://lebarregroup.example${it.url}`,
      })),
    };
  }

  servicePage(opts: { name: string; description: string; url: string; faqs?: { q: string; a: string }[] }): JsonLdNode[] {
    const nodes: JsonLdNode[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: opts.name,
        description: opts.description,
        url: `https://lebarregroup.example${opts.url}`,
        provider: this.organization(),
        areaServed: 'United States',
      },
    ];
    if (opts.faqs?.length) {
      nodes.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: opts.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      });
    }
    return nodes;
  }

  person(member: { fullName: string; honorificPrefix?: string; title: string; expertise: string[]; education: { degree: string; institution: string }[]; links: { label: string; url: string }[]; certifications: string[]; slug: string }): JsonLdNode {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: member.fullName,
      honorificPrefix: member.honorificPrefix || undefined,
      jobTitle: member.title,
      worksFor: { '@type': 'Organization', name: 'The LeBarre Group' },
      knowsAbout: member.expertise,
      hasCredential: member.certifications,
      alumniOf: member.education.map((e) => ({ '@type': 'CollegeOrUniversity', name: e.institution })),
      sameAs: member.links.map((l) => l.url),
      url: `https://lebarregroup.example/team/${member.slug}`,
    };
  }

  article(opts: { headline: string; slug: string; published: string; updated: string; author: any; image: string; description: string }): JsonLdNode {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: opts.headline,
      author: opts.author,
      datePublished: opts.published,
      dateModified: opts.updated,
      image: opts.image,
      description: opts.description,
      url: `https://lebarregroup.example/insights/${opts.slug}`,
      publisher: this.organization(),
    };
  }

  faqPage(items: { q: string; a: string }[]): JsonLdNode {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    };
  }
}
