/* eslint-disable no-console */
/**
 * Seed script — populates the marketing site with a minimum viable content
 * set so the front-end has something to render in dev / staging.
 *
 * Idempotent: re-running upserts on slug/email so it's safe to re-execute
 * after schema-only migrations.
 *
 * Run via: `npm --prefix backend run prisma:seed`
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // ---------- Bootstrap admin user ----------
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@lebarregroup.com').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'change-me-immediately';
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash, role: 'ADMIN' },
  });
  console.log(`✓ admin user: ${adminEmail}`);

  // ---------- Services ----------
  const services = [
    {
      slug: 'crisis-communications',
      name: 'Crisis Communications',
      shortDescription:
        'Rapid-response strategy and execution when a public incident threatens your reputation.',
      longDescription:
        'When the news cycle turns against you, every hour matters. Our crisis-communications practice combines first-hour response playbooks, executive coaching, and stakeholder outreach to stabilise the situation and protect long-term trust.',
      keyOutcomes: [
        '24/7 first-hour response activation',
        'Stakeholder-segmented messaging in under 4 hours',
        'Documented post-incident reputation recovery',
      ],
      faqs: [
        {
          question: 'How quickly can you mobilise after we contact you?',
          answer:
            'Our on-call team activates within one hour of an inbound crisis enquiry, with a draft holding statement to your executive team within four.',
        },
        {
          question: 'Do you work with our existing PR or legal counsel?',
          answer:
            'Yes — we routinely embed alongside in-house communications, outside counsel, and IR teams to align messaging and avoid contradictions across channels.',
        },
        {
          question: 'What happens after the immediate crisis subsides?',
          answer:
            'We deliver a 90-day reputation-recovery roadmap covering owned content, earned media, and stakeholder re-engagement, with measurable sentiment milestones.',
        },
      ],
    },
    {
      slug: 'reputation-management',
      name: 'Reputation Management',
      shortDescription:
        'Proactive reputation building and ongoing positioning for organisations that want to lead the conversation, not chase it.',
      longDescription:
        'Reputation is built before you need it. Our reputation-management practice runs continuous narrative work, third-party validation, and search-presence shaping so that the public record matches the organisation you actually are.',
      keyOutcomes: [
        'Quarterly narrative & sentiment audits',
        'Owned thought-leadership pipeline',
        'Search-result remediation for executives',
      ],
      faqs: [
        {
          question: 'How do you measure reputation outcomes?',
          answer:
            'We track share-of-voice, sentiment trend, and message-pull-through across earned, owned, and shared channels, reported monthly.',
        },
        {
          question: 'Is this only for organisations in trouble?',
          answer:
            'No — most of our reputation engagements are proactive. Organisations who invest in narrative when things are quiet emerge stronger when things get loud.',
        },
        {
          question: 'How long before we see results?',
          answer:
            'Sentiment and share-of-voice metrics typically move within 60–90 days; durable reputation shifts settle over 6–12 months.',
        },
      ],
    },
    {
      slug: 'ai-enhanced-monitoring',
      name: 'AI-Enhanced Monitoring',
      shortDescription:
        'Continuous AI-powered listening across news, social, and search so you see emerging issues before they trend.',
      longDescription:
        'We pair real-time listening pipelines with senior analyst review. Models surface patterns; humans decide what matters. The result: fewer false alarms, earlier warnings, sharper context.',
      keyOutcomes: [
        'Real-time alerting on brand-relevant signals',
        'Analyst-reviewed weekly briefings',
        'Early-warning detection 24–72 hours ahead of mainstream coverage',
      ],
      faqs: [
        {
          question: 'How is this different from a media-monitoring dashboard?',
          answer:
            'Dashboards report what already happened. Our pipelines flag emerging narratives — typically 24–72 hours before they reach mainstream coverage — and pair every alert with a human analyst recommendation.',
        },
        {
          question: 'What sources do you cover?',
          answer:
            'Global news outlets, social platforms, podcasts, regulatory filings, and the open web — including AI-engine answer surfaces.',
        },
        {
          question: 'How do you avoid alert fatigue?',
          answer:
            'Tuning is owned by senior analysts. We commit to a defined alert budget per week and revise thresholds whenever signal-to-noise drops.',
        },
      ],
    },
    {
      slug: 'email-social-strategy',
      name: 'Email & Social Strategy',
      shortDescription:
        'Owned-channel programmes that compound — email, LinkedIn, and the social formats your audience actually opens.',
      longDescription:
        'Owned channels remain the highest-ROI ground for B-to-B reputation. We design editorial calendars, voice systems, and audience-segmentation strategies that turn followers into advocates and inboxes into pipeline.',
      keyOutcomes: [
        'Editorial cadence with measurable open/engagement targets',
        'Executive social presence build-out',
        'Subscriber growth without paid amplification',
      ],
      faqs: [
        {
          question: 'Do you produce the content yourselves?',
          answer:
            'Yes — our team includes former journalists and brand editors who write, edit, and ghost-write. We also coach in-house creators when that fits the strategy better.',
        },
        {
          question: 'Will you grow our list with paid acquisition?',
          answer:
            'Only if it aligns with the strategy. Most of our growth work is organic — content magnets, partner cross-promo, and referral mechanics — because those subscribers convert at higher rates.',
        },
        {
          question: 'How do you handle executive personal brands?',
          answer:
            'We run a structured intake to capture each executive’s point of view, then build a quarterly content arc with full draft-and-approve workflows so their voice stays authentic.',
        },
      ],
    },
  ];

  for (const [idx, s] of services.entries()) {
    const svc = await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        shortDescription: s.shortDescription,
        longDescription: s.longDescription,
        keyOutcomes: s.keyOutcomes,
        displayOrder: idx,
        isActive: true,
      },
      create: {
        slug: s.slug,
        name: s.name,
        shortDescription: s.shortDescription,
        longDescription: s.longDescription,
        keyOutcomes: s.keyOutcomes,
        displayOrder: idx,
        isActive: true,
      },
    });
    // Wipe-and-rewrite FAQs — small enough table that this stays cheap
    // and avoids drift between seed runs.
    await prisma.serviceFaq.deleteMany({ where: { serviceId: svc.id } });
    await prisma.serviceFaq.createMany({
      data: s.faqs.map((f, i) => ({
        serviceId: svc.id,
        question: f.question,
        answer: f.answer,
        displayOrder: i,
      })),
    });
  }
  console.log(`✓ services: ${services.length}`);

  // ---------- Site FAQ (≥15 across 4 categories) ----------
  const siteFaqs: Array<{ category: 'CRISIS' | 'REPUTATION' | 'AI' | 'WORKING_WITH'; question: string; answer: string }> = [
    { category: 'CRISIS', question: 'What counts as a "crisis" worth calling you about?', answer: 'Anything that could materially shift stakeholder trust within 72 hours — regulatory action, accidents, leadership transitions, viral negative coverage, or active misinformation campaigns.' },
    { category: 'CRISIS', question: 'Do you only work with companies, or also individuals and non-profits?', answer: 'Both — we routinely advise CEOs, founders, board chairs, and non-profit executives in addition to organisational engagements.' },
    { category: 'CRISIS', question: 'Can you operate under NDA from the very first call?', answer: 'Yes. A mutual NDA is part of our standard intake and is signed before any sensitive details are shared.' },
    { category: 'CRISIS', question: 'What is your role versus our legal counsel during a crisis?', answer: 'We own the public narrative; counsel owns the legal exposure. We work in lockstep — every public statement is reviewed for legal risk, and every legal posture is tested for narrative impact.' },
    { category: 'REPUTATION', question: 'How is reputation work different from PR?', answer: 'PR earns coverage; reputation work shapes the durable impressions stakeholders carry between coverage events. We measure both, but reputation is the longer-arc discipline.' },
    { category: 'REPUTATION', question: 'Do you guarantee specific media placements?', answer: 'No reputable firm does. We guarantee a defined editorial cadence, story-pitch volume, and benchmark response rates — not specific outlets.' },
    { category: 'REPUTATION', question: 'How do you handle negative search results?', answer: 'A combination of owned-content optimisation, factual-correction outreach, and (where appropriate) right-to-be-forgotten pursuits in eligible jurisdictions.' },
    { category: 'AI', question: 'Are you using AI to write our communications?', answer: 'Only with explicit sign-off, and never without senior human editing. AI is a research and drafting accelerant in our practice, not a substitute for editorial judgement.' },
    { category: 'AI', question: 'How does AI-enhanced monitoring help during a quiet period?', answer: 'It surfaces low-volume early signals — competitor moves, employee sentiment shifts, regulatory chatter — that traditional monitoring misses until they become loud.' },
    { category: 'AI', question: 'Do you train models on our private data?', answer: 'Never on third-party model providers. Where bespoke fine-tuning is justified, we run it on isolated infrastructure under a written data-handling agreement.' },
    { category: 'AI', question: 'How do you guard against AI-generated misinformation about us?', answer: 'We monitor AI-engine answer surfaces (ChatGPT, Perplexity, Gemini) for your brand and remediate inaccuracies through structured-data corrections and direct platform escalations.' },
    { category: 'WORKING_WITH', question: 'How do engagements typically start?', answer: 'A 30-minute scoping call, a written proposal within 48 hours, and a kick-off within one to two weeks of contract signature. Crisis engagements compress this to hours.' },
    { category: 'WORKING_WITH', question: 'What does an engagement cost?', answer: 'Retainers begin in the low five figures monthly. Crisis-only engagements are scoped against severity and duration. Every proposal includes a fixed-fee option.' },
    { category: 'WORKING_WITH', question: 'Do you work internationally?', answer: 'Yes — current and recent engagements span North America, the EU, the UK, and East Asia. We partner with regional specialists for on-the-ground work where useful.' },
    { category: 'WORKING_WITH', question: 'Who will I actually be working with day-to-day?', answer: 'A named senior strategist owns every engagement and stays accountable from first call through wrap. Junior staff support, but the senior lead is your single point of contact.' },
  ];
  await prisma.siteFaq.deleteMany({});
  await prisma.siteFaq.createMany({
    data: siteFaqs.map((f, i) => ({ ...f, displayOrder: i })),
  });
  console.log(`✓ site FAQs: ${siteFaqs.length}`);

  // ---------- Team members ----------
  const team = [
    {
      slug: 'eleanor-lebarre',
      fullName: 'Eleanor LeBarre',
      title: 'Founder & Managing Partner',
      honorificPrefix: 'Ms.',
      bio: 'Eleanor founded LeBarre Group in 2018 after two decades inside global communications agencies and an in-house tour as Chief Communications Officer at a publicly traded financial-services firm. Her practice centres on board-level reputation strategy and high-stakes crisis response.',
      credentials: ['APR'],
      certifications: ['PRSA Accredited in Public Relations'],
      expertise: ['Crisis communications', 'Board-level reputation strategy', 'Executive positioning'],
      education: ['BA Journalism, Northwestern University', 'MBA, Wharton School'],
      skills: ['Crisis response', 'Stakeholder mapping', 'Executive coaching'],
      professionalLinks: [],
      headshotUrl: null,
      linkedinUrl: null,
      displayOrder: 0,
    },
    {
      slug: 'marcus-aldridge',
      fullName: 'Marcus Aldridge',
      title: 'Partner, AI & Insights',
      honorificPrefix: 'Mr.',
      bio: 'Marcus leads the firm’s AI-enhanced monitoring practice. Prior to LeBarre Group he built the data-science team at a top-five global PR network and served as a research fellow at the Reuters Institute.',
      credentials: ['MSc Data Science'],
      certifications: [],
      expertise: ['Computational narrative analysis', 'Sentiment modelling', 'AI-engine answer surfacing'],
      education: ['MSc Data Science, Imperial College London', 'BA Politics, Oxford University'],
      skills: ['NLP pipelines', 'Real-time listening', 'Analyst training'],
      professionalLinks: [],
      headshotUrl: null,
      linkedinUrl: null,
      displayOrder: 1,
    },
  ];
  for (const m of team) {
    await prisma.teamMember.upsert({
      where: { slug: m.slug },
      update: m,
      create: m,
    });
  }
  console.log(`✓ team: ${team.length}`);

  // ---------- Testimonials & client logos ----------
  await prisma.testimonial.deleteMany({});
  await prisma.testimonial.createMany({
    data: [
      {
        quote:
          'LeBarre Group steered us through the toughest 72 hours in our company’s history with calm, precision, and zero theatre. We trust their judgement implicitly.',
        attribution: 'Chief Executive Officer',
        organization: 'NYSE-listed financial services firm',
        isFeatured: true,
        displayOrder: 0,
      },
    ],
  });
  await prisma.clientLogo.deleteMany({});
  await prisma.clientLogo.createMany({
    data: [
      { clientName: 'Confidential — Financial Services', logoUrl: '/assets/logos/client-1.svg', altText: 'Client logo', displayOrder: 0 },
      { clientName: 'Confidential — Healthcare', logoUrl: '/assets/logos/client-2.svg', altText: 'Client logo', displayOrder: 1 },
      { clientName: 'Confidential — Technology', logoUrl: '/assets/logos/client-3.svg', altText: 'Client logo', displayOrder: 2 },
    ],
  });
  console.log('✓ testimonials & logos');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
