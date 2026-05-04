import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { LeadStatus } from '@prisma/client';

/**
 * Used by `PATCH /api/admin/leads/:id`. Either `leadStatus` or any subset of
 * brand-brief fields may be supplied; the service writes audit rows for every
 * brief-field change so the original visitor-submitted values are preserved.
 */
export class UpdateLeadDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  leadStatus?: LeadStatus;

  // Brand-brief enrichments
  @IsOptional() @IsString() @MaxLength(5000) missionStatement?: string;
  @IsOptional() @IsString() @MaxLength(5000) visionStatement?: string;
  @IsOptional() @IsString() @MaxLength(5000) differentiator?: string;
  @IsOptional() @IsString() @MaxLength(8000) brandStory?: string;
  @IsOptional() @IsString() @MaxLength(5000) audiences?: string;
  @IsOptional() @IsString() @MaxLength(2000) voiceDescriptors?: string;
  @IsOptional() @IsString() @MaxLength(5000) successDefinition?: string;
}

export const BRIEF_FIELD_KEYS = [
  'missionStatement',
  'visionStatement',
  'differentiator',
  'brandStory',
  'audiences',
  'voiceDescriptors',
  'successDefinition',
] as const;
export type BriefFieldKey = (typeof BRIEF_FIELD_KEYS)[number];
