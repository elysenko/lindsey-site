// ============================================================
// Static fixture data for the LeBarre Group marketing mockup.
// Replaced by API responses in production.
// ============================================================

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface ServiceItem {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  outcomes: string[];
  faqs: ServiceFaq[];
}

export interface TeamMember {
  slug: string;
  fullName: string;
  honorificPrefix?: string;
  title: string;
  credentials: string[];
  certifications: string[];
  bio: string;
  expertise: string[];
  education: { degree: string; institution: string }[];
  links: { label: string; url: string }[];
  initials: string;
}

export interface InsightPost {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  publishedAt: string;
  updatedAt: string;
  authorSlug: string;
  heroAlt: string;
  category: string;
  readMinutes: number;
  wordCount: number;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export interface FaqGroup {
  category: string;
  items: ServiceFaq[];
}

// ---------- SERVICES ----------
export const SERVICES: ServiceItem[] = [
  {
    slug: 'crisis-communications',
    name: 'Crisis Communications',
    shortDescription:
      'When the story is moving faster than your statement, we are the team you call. Strategic counsel, message control, and stakeholder discipline — at any hour.',
    longDescription:
      'Most crises are not surprises — they are forecasts that were ignored. The LeBarre Group leads organizations through reputational threats, regulatory inquiries, leadership transitions, workforce events, and public-safety moments with a calm, choreographed approach. We anticipate the next 72 hours, set the message architecture, prepare every spokesperson, and align legal, HR, and communications under one operating rhythm. Our hands-on counsel stays through resolution — and through the recovery story that follows.',
    outcomes: [
      '24/7 retainer counsel with a senior partner on the line',
      'Issue-mapping and stakeholder pressure forecast within hours',
      'Holding statements, Q&A, dark-site copy, and approved press lines',
      'Spokesperson preparation, media training, and on-camera coaching',
      'Post-incident reputation rebuild plan with measurement',
    ],
    faqs: [
      {
        q: 'What counts as a crisis you would take on?',
        a: 'Anything with the velocity to dominate stakeholder attention in 24 hours: regulatory action, executive misconduct allegations, a workforce safety event, viral social criticism, a disclosure dispute, M&A leak, or a leadership change that has spiraled. If you are not sure, call us — the call is free, and we will tell you honestly.',
      },
      {
        q: 'How fast can you mobilize?',
        a: 'A senior partner answers within 30 minutes and a working team is briefed within four hours. Active retainer clients have a hotline, an on-call rotation, and pre-cleared statements ready to deploy.',
      },
      {
        q: 'Do you work alongside our outside counsel?',
        a: 'Yes — most of our crisis work runs on a tri-lateral cadence with the client, outside counsel, and us. We respect privilege, we keep documentation tight, and we draft to the standard your lawyers expect.',
      },
      {
        q: 'Will you train internal spokespeople?',
        a: 'Always. We never put a spokesperson on camera that we have not personally rehearsed. Media training is included in every active engagement.',
      },
    ],
  },
  {
    slug: 'reputation-management',
    name: 'Reputation Management',
    shortDescription:
      'Reputation is built in the calm and tested in the storm. We help leaders shape the narrative before the market or moment writes one for them.',
    longDescription:
      'Reputation is a long-horizon asset. We design and steward narrative architecture for executives and institutions: the founding story, the leadership voice, the proof points, and the public moments that compound into trust. Engagements range from a six-month executive visibility runway to multi-year institutional repositioning. The work begins with research — the perception audit you wish you had a year ago — and ends with the kind of share-of-voice and stakeholder sentiment that is durable through market cycles.',
    outcomes: [
      'Quantitative perception audit with stakeholder sentiment baseline',
      'Narrative platform: positioning, proof points, message hierarchy',
      'Executive thought-leadership program (writing, placements, speaking)',
      'Earned-media calendar mapped to business milestones',
      'Quarterly reputation scorecard with sentiment and share-of-voice trends',
    ],
    faqs: [
      {
        q: 'How is this different from PR?',
        a: 'Public relations works the news cycle. Reputation management works the years. We do place media — but only as one tactic inside a multi-year narrative system that includes research, message architecture, executive voice, and stakeholder choreography.',
      },
      {
        q: 'Do you place op-eds and bylines?',
        a: 'Yes. We ghostwrite or co-author with executives and place in tier-one and trade outlets. Every placement maps to a specific narrative goal — we do not chase logos.',
      },
      {
        q: 'How do you measure reputation?',
        a: 'Quarterly scorecard with three lenses: share of voice in defined topics, sentiment movement among priority stakeholders, and message penetration in earned coverage. We share the methodology up front.',
      },
    ],
  },
  {
    slug: 'ai-enhanced-monitoring',
    name: 'AI-Enhanced Monitoring',
    shortDescription:
      'See the weather before the storm. Continuous AI listening across news, social, regulatory, and broker channels — calibrated by humans who know what matters.',
    longDescription:
      'Most monitoring tools tell you what already happened. Our AI-enhanced listening surfaces the signal that matters — early — and a senior analyst contextualizes it. We blend large-language-model classification, custom topic models, and human review to track narrative drift, emerging activists, regulatory chatter, and competitor movement. Briefings are concise: what changed, why it matters, what to do this week. Data is yours, the model is private, and nothing is sent to public training corpora.',
    outcomes: [
      '24/7 listening across news, social, broadcast, and regulatory feeds',
      'Custom topic models tuned to your business, geography, and stakeholders',
      'Daily and weekly executive briefings written by a senior analyst',
      'Early-warning alerts on narrative drift, hostile actors, and emerging activists',
      'Privacy-preserving architecture — your data stays in your tenant',
    ],
    faqs: [
      {
        q: 'Do you replace our existing monitoring vendor?',
        a: 'Often, yes. Many clients consolidate three or four tools into one program with us. Sometimes we sit on top of an existing tool and provide the analyst layer the tool itself cannot deliver.',
      },
      {
        q: 'Where does our data live?',
        a: 'Inside your private tenant. We do not pool client data, and nothing is sent to public model training. Our infrastructure is SOC 2 aligned and audited annually.',
      },
      {
        q: 'How is the AI tuned for our business?',
        a: 'In the first 30 days we ingest your existing materials, agree on topic taxonomies, and calibrate the model with human review. We re-tune quarterly so signal quality compounds.',
      },
    ],
  },
  {
    slug: 'email-social-strategy',
    name: 'Email & Social Strategy',
    shortDescription:
      'Owned channels are your house. We design the editorial cadence, voice, and creative system that keeps your audience leaning in — quarter after quarter.',
    longDescription:
      'Email and social are the only channels you fully own. We treat them like the publishing arm of your reputation strategy. That means a defined editorial point of view, a creative system that scales, a publishing cadence the team can actually keep, and measurement that ties engagement back to pipeline and stakeholder action. We work hand-in-glove with your in-house team — augmenting their capacity, not replacing them — and we hand back a system that runs without us.',
    outcomes: [
      'Editorial strategy with topic pillars, voice, and quarterly themes',
      'Creative system: templates, design tokens, and modular content blocks',
      'Always-on production: writing, design, social-cut down, scheduling',
      'Audience growth tied to defined ICP segments',
      'Performance reporting against pipeline and stakeholder KPIs, not vanity metrics',
    ],
    faqs: [
      {
        q: 'Do you produce the content yourselves?',
        a: 'Yes. Our team writes, designs, and ships — including LinkedIn carousels, executive video clips, weekly newsletters, and event-driven campaigns. Most clients see steady-state output within 30 days.',
      },
      {
        q: 'Will you work with our internal team?',
        a: 'Always. We are an augment, not a replacement. We integrate into your tooling, your editorial calendar, and your approval workflow.',
      },
      {
        q: 'How do you measure success?',
        a: 'Three KPIs from day one: ICP audience growth, engaged-time on owned content, and influence on pipeline or stakeholder action. We share dashboards monthly.',
      },
    ],
  },
];

// ---------- TEAM ----------
export const TEAM: TeamMember[] = [
  {
    slug: 'eleanor-lebarre',
    fullName: 'Eleanor LeBarre',
    honorificPrefix: 'Ms.',
    title: 'Founder & Managing Partner',
    credentials: ['APR', 'M.A. Strategic Communication'],
    certifications: ['Accredited in Public Relations (APR)', 'Crisis Communications Fellow, Institute for PR'],
    bio: 'Eleanor founded The LeBarre Group in 2014 after fifteen years leading communications inside Fortune 500 companies and a major academic medical center. She built the firm around a single conviction: the best crisis response is preparation that actually performed in rehearsal. Eleanor advises CEOs, boards, and general counsel through reputational threats, leadership transitions, and the long-arc work of rebuilding trust. She has counseled clients through more than 200 active crises and led narrative repositioning for institutions ranging from regional health systems to global consumer brands.',
    expertise: [
      'Board-level crisis counsel',
      'CEO communications and succession',
      'Regulatory and government affairs response',
      'Narrative repositioning',
      'Litigation communications',
    ],
    education: [
      { degree: 'M.A., Strategic Communication', institution: 'Northwestern University, Medill' },
      { degree: 'B.A., Political Science', institution: 'Wellesley College' },
    ],
    links: [
      { label: 'LinkedIn', url: 'https://linkedin.com/in/eleanor-lebarre' },
      { label: 'Speaking inquiries', url: '/consult' },
    ],
    initials: 'EL',
  },
  {
    slug: 'marcus-okafor',
    fullName: 'Marcus Okafor',
    honorificPrefix: 'Dr.',
    title: 'Partner, Reputation & Research',
    credentials: ['Ph.D. Communication', 'APR'],
    certifications: ['Accredited in Public Relations (APR)', 'IABC Certified Communication Strategist'],
    bio: 'Marcus leads the firm\'s research and measurement practice. His doctoral work focused on stakeholder sentiment dynamics during regulatory inquiries, and he carries that rigor into every engagement: every narrative we ship is grounded in audience research, every recommendation is testable, every quarter ends with a scorecard. Before joining The LeBarre Group he led measurement at a top-five global agency and taught graduate seminars in public relations research methods.',
    expertise: [
      'Reputation measurement and benchmarking',
      'Stakeholder research design',
      'Narrative testing and message architecture',
      'AI-assisted listening and topic modeling',
    ],
    education: [
      { degree: 'Ph.D., Communication', institution: 'University of North Carolina, Chapel Hill' },
      { degree: 'M.A., Public Relations', institution: 'University of Florida' },
    ],
    links: [{ label: 'LinkedIn', url: 'https://linkedin.com/in/marcus-okafor' }],
    initials: 'MO',
  },
  {
    slug: 'priya-shah',
    fullName: 'Priya Shah',
    honorificPrefix: 'Ms.',
    title: 'Director, AI & Intelligence',
    credentials: ['M.S. Computational Linguistics'],
    certifications: ['SOC 2 Lead Auditor (informational)', 'AWS Solutions Architect — Associate'],
    bio: 'Priya leads the firm\'s AI-enhanced monitoring program. She designs and tunes the topic models, supervises analyst calibration, and owns the privacy architecture that keeps client data inside client tenants. Her career began in newsroom data journalism, moved through trust-and-safety classification at a top-three platform, and now lives at the seam between language models and senior counsel.',
    expertise: [
      'Custom topic modeling and classifier tuning',
      'Newsroom-grade verification standards',
      'Privacy-preserving listening architecture',
      'Crisis early-warning systems',
    ],
    education: [
      { degree: 'M.S., Computational Linguistics', institution: 'Stanford University' },
      { degree: 'B.A., Linguistics', institution: 'University of California, Berkeley' },
    ],
    links: [{ label: 'LinkedIn', url: 'https://linkedin.com/in/priya-shah' }],
    initials: 'PS',
  },
  {
    slug: 'james-whittaker',
    fullName: 'James Whittaker',
    honorificPrefix: 'Mr.',
    title: 'Director, Owned Channels',
    credentials: ['M.B.A.'],
    certifications: ['HubSpot Inbound Certified', 'Google Analytics 4 Certified'],
    bio: 'James leads our email and social practice. He has built editorial systems for B2B SaaS, healthcare, professional services, and a U.S. senator\'s long-form newsletter. His work pairs clear voice with the production discipline that lets in-house teams sustain it after we hand the system back.',
    expertise: [
      'Editorial strategy and voice development',
      'Long-form executive newsletters',
      'LinkedIn programs for executives',
      'Marketing operations and attribution',
    ],
    education: [
      { degree: 'M.B.A.', institution: 'Duke University, Fuqua' },
      { degree: 'B.A., English', institution: 'College of William & Mary' },
    ],
    links: [{ label: 'LinkedIn', url: 'https://linkedin.com/in/james-whittaker' }],
    initials: 'JW',
  },
];

// ---------- TESTIMONIALS ----------
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "When the AG inquiry hit, Eleanor's team was on the line in twenty minutes and stayed for nine months. They wrote calmer than we felt and faster than the news cycle. We came out the other side with our license, our board, and our market intact.",
    author: 'General Counsel',
    role: 'Regional Health System',
  },
  {
    quote:
      'The LeBarre Group rebuilt our story without rebuilding our identity. By the end of the second quarter, our share of voice in the topics that mattered tripled — and the analysts noticed.',
    author: 'Chief Marketing Officer',
    role: 'Public B2B SaaS Company',
  },
  {
    quote:
      'They are the only outside team I have worked with that the board, the lawyers, and the comms staff all trust at the same time. That is the bar.',
    author: 'CEO',
    role: 'National Nonprofit',
  },
];

// ---------- LOGOS (placeholder client trust strip) ----------
export const CLIENT_LOGOS = [
  'MERIDIAN HEALTH',
  'ATELIER CAPITAL',
  'NORTHWAVE',
  'CARDINAL PARTNERS',
  'STILLPOINT',
  'AVERY FOUNDATION',
];

// ---------- INSIGHTS ----------
const longBody = (lead: string, headings: { h: string; p: string[] }[]): string => {
  const intro = `<p class="lede">${lead}</p>`;
  const sections = headings
    .map(
      (s) =>
        `<h2>${s.h}</h2>` +
        s.p.map((para) => `<p>${para}</p>`).join('')
    )
    .join('');
  return intro + sections;
};

export const INSIGHTS: InsightPost[] = [
  {
    slug: 'preparation-that-performs',
    title: 'Preparation That Performs: Why Most Crisis Plans Collapse on Day One',
    excerpt:
      'A crisis plan that lives in a binder is not a plan. It is an artifact. Real preparation looks like rehearsal — and we make a case for the kind that actually performs.',
    publishedAt: '2026-04-21',
    updatedAt: '2026-04-28',
    authorSlug: 'eleanor-lebarre',
    heroAlt: 'Conference room at dusk',
    category: 'Crisis Communications',
    readMinutes: 9,
    wordCount: 1620,
    body: longBody(
      'In two decades of working alongside boards in their hardest hours, we have noticed a pattern: organizations with the thickest crisis binders are not the organizations that recover the fastest. Recovery correlates almost perfectly with one variable — whether the team practiced before the day they needed it.',
      [
        {
          h: 'The Binder Is Not the Plan',
          p: [
            'A crisis plan that has not been rehearsed is a piece of writing. It captures who is meant to do what, in what order, and on what cadence — but it does not capture how those people behave when the news cycle is moving faster than their group chat.',
            'We have seen well-funded organizations with magnificent documentation collapse in the first eight hours of a crisis. We have seen modest organizations with a single, well-rehearsed twelve-page playbook hold the line for weeks. The difference is not the document. The difference is whether the people in the room have ever practiced disagreeing with each other under time pressure.',
            'The binder is a deliverable. The capability is what saves you.',
          ],
        },
        {
          h: 'Rehearsal Is Not a Tabletop',
          p: [
            'Tabletop exercises are useful and almost always insufficient. A tabletop tests message — does the team agree on the framing, the spokesperson, the audience priority? It rarely tests behavior under load.',
            'A real rehearsal includes message stress, technical stress, and human stress. Message stress means the team has to write a holding statement in 22 minutes that the lawyer signs off on. Technical stress means the document, the dark site, and the email send all have to actually function. Human stress means at least one person has to be told that the spokesperson is unavailable and they need to step in.',
            'When all three are present, you discover the things the binder did not tell you: that the head of HR will not push send without three approvals, that the dark site has been broken since the last platform migration, that the CEO\'s assistant — not the CEO — controls the calendar that determines whether you can convene a board call before a 4pm publication.',
          ],
        },
        {
          h: 'What Day-One Excellence Looks Like',
          p: [
            'When preparation has performed, day one of a crisis is calm. Not because the situation is calm — it is rarely calm — but because the people in the room have done this before.',
            'The first call is the right call. The first statement is on the right axis. The right people are in the right room within ninety minutes. The lawyer and the communicator are not at war. The board is briefed before they hear it from a reporter. Internal employees hear from leadership before they hear from social media. The CEO is rested and rehearsed because someone told her at hour two that this was going to be a 72-hour cycle.',
            'None of that happens by accident. All of it happens because someone decided, in the calm before, to invest in the rehearsal.',
          ],
        },
        {
          h: 'A Practical Rehearsal Cadence',
          p: [
            'For most institutions, the right cadence is two full rehearsals per year and four message drills. The full rehearsals run four hours and stress all three vectors — message, technical, and human. The message drills run forty-five minutes and stress only the writing. Cumulatively, the team builds the muscle memory of moving from briefing to draft to approved statement in under an hour.',
            'We pair each rehearsal with a written after-action that goes to the CEO and audit committee. Not because we love documentation, but because crisis capability is a board-level asset and the board deserves visibility into whether the asset is being maintained.',
          ],
        },
        {
          h: 'When the Real Day Comes',
          p: [
            'On the day the news breaks, the prepared team feels something that the unprepared team almost never feels: not relief, but recognition. They have been here before. The pace is familiar. The disagreements are predictable. The CEO has rehearsed the spokesperson role, and her hands are steady on camera.',
            'That is preparation that performs. It is not a binder. It is a habit. And it is the single most cost-effective reputational investment most organizations have not yet made.',
            'If the last twelve months have made you wonder whether your team would actually hold the line on the day the call comes, the answer is probably uncomfortable — and the path forward is straightforward. Rehearse. Then rehearse again.',
          ],
        },
      ]
    ),
  },
  {
    slug: 'ai-listening-in-2026',
    title: 'AI Listening in 2026: What the Tools Actually See, and What They Still Miss',
    excerpt:
      'A field guide to what large-language-model classifiers can and cannot do for senior communicators — and where the human analyst still has to live.',
    publishedAt: '2026-03-12',
    updatedAt: '2026-03-19',
    authorSlug: 'priya-shah',
    heroAlt: 'Server room with warm lighting',
    category: 'AI Services',
    readMinutes: 11,
    wordCount: 1780,
    body: longBody(
      'In the past two years, every major listening vendor has bolted a large-language model onto its stack. Some of the integrations are powerful. Most of them are oversold. Senior communicators deserve a clear answer to a simple question: what can the new tools actually do, and where does the analyst still have to live?',
      [
        {
          h: 'What the Models Got Better At',
          p: [
            'Classification has genuinely improved. Topic-level precision on well-defined corpora — pharmaceutical safety chatter, supply-chain disruption discourse, executive sentiment in financial news — is dramatically better than what we had with bag-of-words and naive Bayes pipelines five years ago.',
            'Synthesis has also improved. The same model that classifies a thousand articles can produce a passable executive summary in seconds. The summary is not a finished briefing — but it is a much better starting point than an empty page.',
            'Translation across languages has improved enough that the cost of monitoring a hundred markets is closer to the cost of monitoring ten than it was at the start of the decade. For multinationals this changes the economics meaningfully.',
          ],
        },
        {
          h: 'Where the Models Still Fall Down',
          p: [
            'Sarcasm and coded language remain unreliable signals. A model can be trained on a single client domain and reach acceptable performance — but out of the box, modern LLMs still hallucinate sentiment on coded political discourse, brand-coded fan-community speech, and sarcasm-heavy regulatory critique.',
            'Causal reasoning remains weak. Models can identify that a topic is rising but they remain poor at distinguishing genuine narrative momentum from coordinated inauthentic amplification. That distinction is the entire job during a crisis.',
            'Verification is still fundamentally a human task. A senior analyst with newsroom training can verify a claim against three independent sources in eight minutes. The model cannot do that — and the cost of a false positive in an executive briefing is much higher than the cost of waiting eight minutes.',
          ],
        },
        {
          h: 'How We Use Models in Practice',
          p: [
            'In our practice, the model layer does three things well. It classifies the firehose. It produces the candidate-summary that an analyst then verifies. And it surfaces narrative drift faster than any human reviewer can scan.',
            'The analyst layer does three different things. It verifies. It contextualizes against the client\'s specific stakeholder map. And it makes the call about what the executive needs to know this week — which is a judgment call that no model is yet making well.',
          ],
        },
        {
          h: 'What to Ask Your Vendor',
          p: [
            'Three questions separate the serious vendors from the marketing-driven ones. First: where does our data live, and is it ever sent to a public training corpus? Second: how do you tune the topic models for our specific business, and how often do you re-tune? Third: what is the human review rate, and who is the senior person whose name is on the briefing?',
            'If any of those answers are evasive, that is your answer. The category is moving fast and the buyers who ask the right questions will be far better served than the buyers who buy the demo.',
          ],
        },
      ]
    ),
  },
  {
    slug: 'reputation-as-asset',
    title: 'Reputation as an Asset Class: A Framework for the Boardroom',
    excerpt:
      'Reputation is the single most undervalued asset on most balance sheets. We propose a board-level framework for managing it like one.',
    publishedAt: '2026-02-04',
    updatedAt: '2026-02-04',
    authorSlug: 'marcus-okafor',
    heroAlt: 'Boardroom at sunrise',
    category: 'Reputation Management',
    readMinutes: 10,
    wordCount: 1690,
    body: longBody(
      'Boards spend hours each quarter reviewing capital allocation, talent pipelines, and risk registers. Reputation — almost always the largest off-balance-sheet asset the institution holds — is rarely on the agenda except in the quarter it has already been damaged. We propose a different cadence.',
      [
        {
          h: 'Why Reputation Is an Asset',
          p: [
            'Reputation behaves like an asset in every sense that matters. It compounds with consistent investment. It can be impaired in a single quarter. It can be repaired only with sustained, expensive effort. And it shows up in every other line on the income statement — pricing power, talent acquisition cost, regulatory friction, customer retention.',
            'When boards do not measure it, they default to managing it reactively. That is the most expensive way to hold the asset.',
          ],
        },
        {
          h: 'The Three-Lens Scorecard',
          p: [
            'In our practice we recommend a quarterly scorecard with three lenses: share of voice in defined topics, sentiment movement among priority stakeholders, and message penetration in earned coverage. Each lens has a baseline, a target, and a quarterly delta. The whole report is two pages.',
            'Two pages is the right length. The longer the report, the lower the probability the board reads it. We have learned that the audit committee that reads a two-page reputation scorecard each quarter is more useful to the institution than the audit committee that has access to a 47-page dashboard nobody opens.',
          ],
        },
        {
          h: 'The Reputation Risk Register',
          p: [
            'Alongside the scorecard, every institution should maintain a reputation risk register. Same format as the enterprise risk register: rank-ordered exposures with mitigations, owners, and an escalation threshold. Most clients are surprised by what makes the top three when they actually do this exercise — it is rarely what they thought before they started.',
            'The risk register is the planning artifact. The scorecard is the measurement artifact. Together they let the board manage reputation the way they manage every other asset of consequence.',
          ],
        },
        {
          h: 'What Good Looks Like',
          p: [
            'A board that manages reputation as an asset spends roughly thirty minutes per quarter on the scorecard, fifteen minutes on the risk register, and one full session per year on a reputation strategy review with the CEO. That cadence is enough to make reputation a managed asset rather than a vulnerability.',
            'It is also enough to make the institution materially harder to surprise. And in our experience that is the dividend the board cares about most.',
          ],
        },
      ]
    ),
  },
];

// ---------- FAQ PAGE GROUPS ----------
export const FAQ_GROUPS: FaqGroup[] = [
  {
    category: 'Crisis Communications',
    items: [
      {
        q: 'How do I know if what we are facing actually counts as a crisis?',
        a: 'Three tests: velocity, asymmetry, and stakeholder alignment. If the situation is moving faster than your normal communications cadence, if the downside is meaningfully larger than the upside, and if your stakeholders are likely to disagree about what should be said — you are in a crisis. Call us.',
      },
      {
        q: 'What does the first hour with you actually look like?',
        a: 'A senior partner answers within thirty minutes. We run a short triage call: what happened, who knows, what has been said, what cannot be said. Within four hours we have a working team briefed, an issue map drafted, and the first holding statement in your inbox.',
      },
      {
        q: 'Will you work with our outside counsel?',
        a: 'Always. Most of our crisis engagements run on a tri-lateral cadence with the client, outside counsel, and us. We respect privilege, document carefully, and draft to the standard your lawyers expect.',
      },
      {
        q: 'Do you handle the media calls or do we?',
        a: 'Either, depending on the engagement. For active crises, our team typically takes inbound press during the most acute hours. We hand back to your in-house team as the cycle stabilizes.',
      },
    ],
  },
  {
    category: 'Reputation Management',
    items: [
      {
        q: 'How long is a typical reputation engagement?',
        a: 'Six months at minimum, twelve to twenty-four months for institutional repositioning. Reputation moves slowly enough that anything shorter is mostly tactical PR.',
      },
      {
        q: 'How do you measure progress quarter to quarter?',
        a: 'Three lenses: share of voice in defined topics, stakeholder sentiment movement, and message penetration in earned coverage. We share the methodology up front and the scorecard quarterly.',
      },
      {
        q: 'Do you write op-eds and bylines for executives?',
        a: 'Yes — typically as a co-author or ghostwriter, always with the executive\'s voice. Every placement maps to a specific narrative goal.',
      },
      {
        q: 'Will you help us with executive visibility on social?',
        a: 'Yes — through our owned-channels practice. Most of our reputation clients add an executive thought-leadership program in month two or three.',
      },
    ],
  },
  {
    category: 'AI Services',
    items: [
      {
        q: 'Where does our data live?',
        a: 'Inside your private tenant. We do not pool client data, and nothing is sent to public model training. Our infrastructure is SOC 2 aligned and audited annually.',
      },
      {
        q: 'How is the model tuned to our business?',
        a: 'In the first thirty days we ingest your existing materials, agree on topic taxonomies, and calibrate the classifier with human review. We re-tune the model quarterly so signal quality compounds over time.',
      },
      {
        q: 'Do you replace our existing monitoring vendor?',
        a: 'Often, yes — many clients consolidate three or four tools into one program with us. Sometimes we sit on top of an existing tool and provide the senior-analyst layer the tool itself does not offer.',
      },
      {
        q: 'Can the AI replace the analyst?',
        a: 'No, and we would not let it. The model classifies the firehose, but the human analyst verifies, contextualizes, and makes the call about what the executive needs to know this week. That last call is still a human judgment.',
      },
    ],
  },
  {
    category: 'Working with LeBarre Group',
    items: [
      {
        q: 'How does engagement typically begin?',
        a: 'A free 30-minute consultation call. If the fit is right, we propose a scoped engagement — often a six-week diagnostic followed by an ongoing program.',
      },
      {
        q: 'What is your billing model?',
        a: 'Monthly retainers for ongoing programs and project fees for defined engagements. Crisis retainers include a 24/7 hotline. We share fee ranges in the first call.',
      },
      {
        q: 'Where are you based?',
        a: 'Headquartered in the Mid-Atlantic with senior partners in New York, Washington, and Atlanta. Engagements run virtual-first, with on-site cadence as the work demands.',
      },
      {
        q: 'Are conversations confidential before we sign anything?',
        a: 'Always. The first call is under NDA the moment you ask. Nothing said is repeated outside the firm.',
      },
      {
        q: 'How do we get started?',
        a: 'Use the consultation form on this site. A senior partner will be in touch within one business day.',
      },
    ],
  },
];

// ---------- ADMIN FIXTURE DATA ----------
export interface AdminLead {
  id: string;
  fullName: string;
  organization: string;
  email: string;
  phone: string;
  serviceInterest: string;
  challengeCategories: string[];
  situation: string;
  submittedAt: string;
  briefStatus: 'pending' | 'completed';
  leadStatus: 'new' | 'contacted' | 'closed';
  brief?: BrandBrief;
  notes: { author: string; ts: string; body: string }[];
  audit: { field: string; from: string; to: string; ts: string; by: string }[];
}

export interface BrandBrief {
  mission?: string;
  vision?: string;
  differentiator?: string;
  story?: string;
  audiences?: string;
  voice?: string;
  successDefinition?: string;
}

export const ADMIN_LEADS: AdminLead[] = [
  {
    id: 'L-1042',
    fullName: 'Hannah Reyes',
    organization: 'Northshore Health Alliance',
    email: 'hannah.reyes@northshore-health.example',
    phone: '(312) 555-0117',
    serviceInterest: 'Crisis Communications',
    challengeCategories: ['Active crisis / reputation issue', 'Stakeholder or community communications'],
    situation:
      'State AG inquiry concerning billing practices became public yesterday. Local press has reached out twice. Internal anxiety is high. Need to align with outside counsel by tomorrow morning.',
    submittedAt: '2026-05-03T16:42:00Z',
    briefStatus: 'pending',
    leadStatus: 'new',
    notes: [],
    audit: [],
  },
  {
    id: 'L-1041',
    fullName: 'Daniel Foster',
    organization: 'Atelier Capital',
    email: 'd.foster@ateliercapital.example',
    phone: '(917) 555-0143',
    serviceInterest: 'Reputation Management',
    challengeCategories: ['Brand refresh or repositioning', 'Proactive reputation building'],
    situation:
      'Family office spinning out into a third-party manager next year. Need to build a public-facing reputation from a near-zero base over the next 12 months.',
    submittedAt: '2026-05-02T11:08:00Z',
    briefStatus: 'completed',
    leadStatus: 'contacted',
    brief: {
      mission: 'Steward generational capital with the patience and discipline of a private operator.',
      vision: 'Be the most trusted long-duration manager in the lower mid-market.',
      differentiator:
        'Twenty-eight years of private-operator track record before opening to outside capital.',
      story:
        'Founded in 1996 as a single-family office. Compounded for three generations before any outside dollar was accepted.',
      audiences: 'Family offices, foundations, sophisticated wealth advisors, allocators in the $25M–$250M range.',
      voice: 'Plainspoken, patient, evidence-based, never hyperbolic.',
      successDefinition: 'Three institutional allocators committed by Q3 next year; trade-press coverage in two tier-one outlets.',
    },
    notes: [
      {
        author: 'Eleanor LeBarre',
        ts: '2026-05-02T15:11:00Z',
        body: 'Briefed Marcus. Recommend a 6-week diagnostic followed by 12-month program. Schedule discovery for next Tuesday.',
      },
    ],
    audit: [],
  },
  {
    id: 'L-1040',
    fullName: 'Sara Goldstein',
    organization: 'Avery Foundation',
    email: 'sara@averyfdn.example',
    phone: '(404) 555-0162',
    serviceInterest: 'Email & Social Strategy',
    challengeCategories: ['Campaign or initiative launch', 'Ongoing communications strategy'],
    situation:
      'Launching a new $40M programmatic initiative in the fall. Need editorial system that the four-person comms team can sustain after launch.',
    submittedAt: '2026-04-28T09:21:00Z',
    briefStatus: 'completed',
    leadStatus: 'contacted',
    brief: {
      mission: 'Catalyze evidence-based programs that strengthen community resilience in the Southeast.',
      differentiator: 'A true operator-grantmaker — half the staff has run nonprofits before joining the foundation.',
      audiences: 'Grantee organizations, peer foundations, state-level policy actors.',
      voice: 'Generous, direct, never self-congratulatory.',
      successDefinition: 'Initiative announcement reaches priority audiences; first cohort applications exceed target by 25%.',
    },
    notes: [],
    audit: [
      {
        field: 'Brief — Vision',
        from: '(empty)',
        to: 'Catalyze evidence-based programs across the Southeast region.',
        ts: '2026-04-29T13:02:00Z',
        by: 'James Whittaker',
      },
    ],
  },
  {
    id: 'L-1039',
    fullName: 'Wei Lin',
    organization: 'Stillpoint Health',
    email: 'wei.lin@stillpoint.example',
    phone: '(206) 555-0192',
    serviceInterest: 'AI-Enhanced Monitoring',
    challengeCategories: ['Proactive reputation building'],
    situation:
      'Replacing a tier-three listening tool. Want senior-analyst briefings, not dashboards. Six markets, three languages.',
    submittedAt: '2026-04-21T18:55:00Z',
    briefStatus: 'pending',
    leadStatus: 'closed',
    notes: [
      {
        author: 'Priya Shah',
        ts: '2026-04-23T14:30:00Z',
        body: 'Closed — selected an in-house build. Re-engage in 9 months.',
      },
    ],
    audit: [],
  },
  {
    id: 'L-1038',
    fullName: 'Robert Nguyen',
    organization: 'Cardinal Partners',
    email: 'r.nguyen@cardinalpartners.example',
    phone: '(617) 555-0108',
    serviceInterest: 'Crisis Communications',
    challengeCategories: ['Something else'],
    situation:
      'Considering a retainer ahead of a complex board transition. No active issue but want preparation in place.',
    submittedAt: '2026-04-15T13:14:00Z',
    briefStatus: 'completed',
    leadStatus: 'contacted',
    brief: {
      mission: 'Lower mid-market private equity with a buy-and-build thesis.',
      audiences: 'Limited partners, portfolio CEOs, deal counterparties.',
      voice: 'Confident, understated, never promotional.',
      successDefinition: 'Crisis preparedness in place ahead of next fundraise.',
    },
    notes: [],
    audit: [],
  },
];

export const CHALLENGE_CATEGORIES = [
  'Active crisis / reputation issue',
  'Proactive reputation building',
  'Campaign or initiative launch',
  'Stakeholder or community communications',
  'Brand refresh or repositioning',
  'Ongoing communications strategy',
  'Something else',
];
