/**
 * Typed contracts mirroring the NestJS REST API. Kept narrow to the fields
 * the UI consumes — wider response shapes will still parse fine because
 * Angular's HttpClient does not strip extra keys.
 *
 * Keep these in sync with `backend/src/**` if the API evolves.
 */

// ---------- Enums shared with the backend ----------

export type ChallengeCategoryEnum =
  | 'ACTIVE_CRISIS'
  | 'PROACTIVE_REPUTATION'
  | 'CAMPAIGN_LAUNCH'
  | 'STAKEHOLDER_COMMS'
  | 'BRAND_REFRESH'
  | 'ONGOING_STRATEGY'
  | 'OTHER';

export type LeadStatusEnum = 'NEW' | 'CONTACTED' | 'CLOSED';
export type BriefStatusEnum = 'PENDING' | 'COMPLETED';
export type SiteFaqCategoryEnum = 'CRISIS' | 'REPUTATION' | 'AI' | 'WORKING_WITH';
export type InsightStatusEnum = 'DRAFT' | 'PUBLISHED';
export type UserRoleEnum = 'ADMIN' | 'EDITOR';

// Human-readable challenge category labels used by the consultation form.
// Must stay in sync with the spec wording.
export const CHALLENGE_CATEGORY_LABELS: Record<ChallengeCategoryEnum, string> = {
  ACTIVE_CRISIS: 'Active crisis / reputation issue',
  PROACTIVE_REPUTATION: 'Proactive reputation building',
  CAMPAIGN_LAUNCH: 'Campaign or initiative launch',
  STAKEHOLDER_COMMS: 'Stakeholder or community communications',
  BRAND_REFRESH: 'Brand refresh or repositioning',
  ONGOING_STRATEGY: 'Ongoing communications strategy',
  OTHER: 'Something else',
};

export const LABEL_TO_CHALLENGE_CATEGORY: Record<string, ChallengeCategoryEnum> =
  Object.fromEntries(
    Object.entries(CHALLENGE_CATEGORY_LABELS).map(([k, v]) => [v, k as ChallengeCategoryEnum]),
  );

// ---------- Auth ----------

export interface AuthUserDto {
  id: string;
  email: string;
  role: UserRoleEnum;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUserDto;
}

// ---------- Consultations ----------

export interface CreateConsultationRequest {
  fullName: string;
  organization: string;
  email: string;
  phone?: string;
  primaryServiceSlug?: string;
  challengeCategories: ChallengeCategoryEnum[];
  situationDescription: string;
}

export interface CreateConsultationResponse {
  briefToken: string;
  redirectTo: string;
}

// ---------- Brand brief ----------

export interface BrandBriefDto {
  missionStatement: string | null;
  visionStatement: string | null;
  differentiator: string | null;
  brandStory: string | null;
  audiences: string | null;
  voiceDescriptors: string | null;
  successDefinition: string | null;
}

export interface BriefShellDto {
  fullName: string;
  organization: string;
  primaryServiceSlug: string | null;
  challengeCategories: ChallengeCategoryEnum[];
  briefStatus: BriefStatusEnum;
  brief: BrandBriefDto | null;
}

export interface UpsertBriefRequest {
  missionStatement?: string;
  visionStatement?: string;
  differentiator?: string;
  brandStory?: string;
  audiences?: string;
  voiceDescriptors?: string;
  successDefinition?: string;
}

export interface UpsertBriefResponse {
  ok: true;
  submittedAt: string;
}

// ---------- Public content ----------

export interface ServiceFaqDto {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
}

export interface ServiceDto {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  keyOutcomes: string[];
  displayOrder: number;
  isActive: boolean;
  faqs: ServiceFaqDto[];
}

export interface ServicesListResponse {
  items: ServiceDto[];
  jsonLd: unknown;
}

export interface ServiceDetailResponse {
  service: ServiceDto;
  jsonLd: {
    service: unknown;
    faq: unknown;
    breadcrumbs: unknown;
  };
}

export interface TeamMemberSummaryDto {
  id: string;
  slug: string;
  fullName: string;
  title: string;
  honorificPrefix: string | null;
  headshotUrl: string | null;
  linkedinUrl: string | null;
  credentials: string[];
}

export interface TeamMemberDetailDto extends TeamMemberSummaryDto {
  certifications: string[];
  expertise: string[];
  education: { degree: string; institution: string }[];
  skills: string[];
  professionalLinks: { label: string; url: string }[];
  bio: string;
}

export interface TeamMemberDetailResponse {
  member: TeamMemberDetailDto;
  jsonLd: { person: unknown; breadcrumbs: unknown };
}

export interface SiteFaqGroupsResponse {
  groups: Record<string, { question: string; answer: string }[]>;
  jsonLd: unknown;
}

export interface InsightsListItemDto {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  heroImageUrl: string | null;
  publishedAt: string | null;
  lastUpdatedAt: string | null;
  author: { slug: string; fullName: string; title: string };
}

export interface InsightsListResponse {
  items: InsightsListItemDto[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface InsightDetailDto {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  heroImageUrl: string | null;
  publishedAt: string | null;
  lastUpdatedAt: string | null;
  status: InsightStatusEnum;
  author: TeamMemberDetailDto;
}

export interface InsightDetailResponse {
  post: InsightDetailDto;
  jsonLd: { article: unknown; breadcrumbs: unknown };
}

// ---------- Admin ----------

export type LeadSort =
  | 'createdAt:desc'
  | 'createdAt:asc'
  | 'organization:asc'
  | 'organization:desc';

export interface AdminLeadsListQuery {
  page?: number;
  pageSize?: number;
  challengeCategory?: ChallengeCategoryEnum;
  leadStatus?: LeadStatusEnum;
  briefStatus?: BriefStatusEnum;
  sort?: LeadSort;
}

export interface AdminLeadListItem {
  id: string;
  fullName: string;
  organization: string;
  email: string;
  challengeCategories: ChallengeCategoryEnum[];
  createdAt: string;
  briefStatus: BriefStatusEnum;
  leadStatus: LeadStatusEnum;
  primaryService: { slug: string; name: string } | null;
}

export interface AdminLeadsListResponse {
  items: AdminLeadListItem[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface AdminLeadNoteDto {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; email: string };
}

export interface AdminBrandBriefAuditDto {
  id: string;
  fieldName: string;
  previousValue: string | null;
  newValue: string | null;
  editedAt: string;
  editedBy: { id: string; email: string };
}

export interface AdminBrandBriefDto extends BrandBriefDto {
  id: string;
  submittedAt: string | null;
  audits: AdminBrandBriefAuditDto[];
}

export interface AdminLeadDetailDto {
  id: string;
  fullName: string;
  organization: string;
  email: string;
  phone: string | null;
  challengeCategories: ChallengeCategoryEnum[];
  situationDescription: string;
  createdAt: string;
  briefStatus: BriefStatusEnum;
  leadStatus: LeadStatusEnum;
  primaryService: { id: string; slug: string; name: string } | null;
  brandBrief: AdminBrandBriefDto | null;
  notes: AdminLeadNoteDto[];
}

export type BriefFieldKey =
  | 'missionStatement'
  | 'visionStatement'
  | 'differentiator'
  | 'brandStory'
  | 'audiences'
  | 'voiceDescriptors'
  | 'successDefinition';

export interface UpdateLeadRequest {
  leadStatus?: LeadStatusEnum;
  missionStatement?: string;
  visionStatement?: string;
  differentiator?: string;
  brandStory?: string;
  audiences?: string;
  voiceDescriptors?: string;
  successDefinition?: string;
}

export interface CreateNoteRequest {
  body: string;
}

export interface AdminInsightUpsertRequest {
  slug?: string;
  title?: string;
  excerpt?: string;
  body?: string;
  heroImageUrl?: string;
  authorTeamMemberId?: string;
  status?: InsightStatusEnum;
  publishedAt?: string;
}

export interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  retryAfterSec?: number;
  redirect?: string;
}
