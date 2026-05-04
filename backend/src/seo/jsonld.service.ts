import { Injectable } from '@nestjs/common';

/**
 * Server-side builders for the JSON-LD blobs the front-end embeds in SSR
 * pages. Centralising them here keeps the schema vocabulary consistent
 * across pages and gives us one place to update if Schema.org definitions
 * shift.
 *
 * The shape returned matches the JSON-LD spec — front-end just needs to
 * `JSON.stringify` it inside <script type="application/ld+json">.
 */

interface TeamMemberJson {
  fullName: string;
  title: string;
  honorificPrefix: string | null;
  bio: string;
  headshotUrl: string | null;
  linkedinUrl: string | null;
  credentials: unknown;
  certifications: unknown;
  expertise: unknown;
  education: unknown;
  skills: unknown;
  professionalLinks: unknown;
  slug: string;
}

interface ServiceJson {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
}

interface InsightJson {
  slug: string;
  title: string;
  excerpt: string;
  heroImageUrl: string | null;
  publishedAt: Date | null;
  lastUpdatedAt: Date | null;
  author: { slug: string; fullName: string; title: string };
}

@Injectable()
export class JsonLdService {
  private get origin(): string {
    return (process.env.PUBLIC_SITE_ORIGIN ?? 'https://lebarregroup.com').replace(/\/$/, '');
  }

  private url(path: string): string {
    return `${this.origin}${path.startsWith('/') ? path : `/${path}`}`;
  }

  organization() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'LeBarre Group',
      legalName: 'LeBarre Group',
      url: this.origin,
      logo: this.url('/assets/logo.svg'),
      description:
        'Strategic communications, crisis response, and AI-enhanced reputation management for organizations under pressure.',
      foundingDate: '2018-01-01',
      sameAs: [],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: process.env.ADMIN_NOTIFICATION_EMAIL ?? 'hello@lebarregroup.com',
          areaServed: 'Worldwide',
        },
      ],
    };
  }

  serviceCatalog(services: ServiceJson[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'OfferCatalog',
      name: 'LeBarre Group Services',
      itemListElement: services.map((s, idx) => ({
        '@type': 'Offer',
        position: idx + 1,
        itemOffered: this.service(s),
      })),
    };
  }

  service(s: ServiceJson) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: s.name,
      description: s.shortDescription,
      url: this.url(`/services/${s.slug}`),
      provider: { '@type': 'Organization', name: 'LeBarre Group', url: this.origin },
      areaServed: 'Worldwide',
    };
  }

  faqPage(qa: { question: string; answer: string }[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: qa.map((p) => ({
        '@type': 'Question',
        name: p.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: p.answer,
        },
      })),
    };
  }

  person(member: TeamMemberJson) {
    const credentials = Array.isArray(member.credentials) ? member.credentials : [];
    const certifications = Array.isArray(member.certifications) ? member.certifications : [];
    const expertise = Array.isArray(member.expertise) ? member.expertise : [];
    const education = Array.isArray(member.education) ? member.education : [];
    const skills = Array.isArray(member.skills) ? member.skills : [];
    const professionalLinks = Array.isArray(member.professionalLinks)
      ? member.professionalLinks
      : [];
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: member.fullName,
      honorificPrefix: member.honorificPrefix ?? undefined,
      jobTitle: member.title,
      description: member.bio,
      image: member.headshotUrl ?? undefined,
      url: this.url(`/team/${member.slug}`),
      sameAs: [member.linkedinUrl, ...professionalLinks].filter(Boolean),
      hasCredential: [...credentials, ...certifications],
      knowsAbout: [...expertise, ...skills],
      alumniOf: education,
      worksFor: { '@type': 'Organization', name: 'LeBarre Group', url: this.origin },
    };
  }

  article(post: InsightJson) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt,
      image: post.heroImageUrl ?? undefined,
      datePublished: post.publishedAt?.toISOString(),
      dateModified: (post.lastUpdatedAt ?? post.publishedAt)?.toISOString(),
      mainEntityOfPage: this.url(`/insights/${post.slug}`),
      author: {
        '@type': 'Person',
        name: post.author.fullName,
        jobTitle: post.author.title,
        url: this.url(`/team/${post.author.slug}`),
      },
      publisher: {
        '@type': 'Organization',
        name: 'LeBarre Group',
        url: this.origin,
        logo: { '@type': 'ImageObject', url: this.url('/assets/logo.svg') },
      },
    };
  }

  breadcrumbs(crumbs: { name: string; path: string }[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: c.name,
        item: this.url(c.path),
      })),
    };
  }
}
