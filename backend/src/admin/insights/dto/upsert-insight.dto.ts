import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { InsightsPostStatus } from '@prisma/client';

export class CreateInsightDto {
  @IsString() @MinLength(1) @MaxLength(80)
  slug!: string;

  @IsString() @MinLength(1) @MaxLength(200)
  title!: string;

  @IsString() @MinLength(1) @MaxLength(500)
  excerpt!: string;

  @IsString() @MinLength(1)
  body!: string;

  @IsOptional() @IsString() @MaxLength(500)
  heroImageUrl?: string;

  @IsString() @MinLength(1)
  authorTeamMemberId!: string;

  @IsOptional() @IsEnum(InsightsPostStatus)
  status?: InsightsPostStatus;

  @IsOptional() @IsDateString()
  publishedAt?: string;
}

export class UpdateInsightDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(80)
  slug?: string;

  @IsOptional() @IsString() @MinLength(1) @MaxLength(200)
  title?: string;

  @IsOptional() @IsString() @MinLength(1) @MaxLength(500)
  excerpt?: string;

  @IsOptional() @IsString() @MinLength(1)
  body?: string;

  @IsOptional() @IsString() @MaxLength(500)
  heroImageUrl?: string;

  @IsOptional() @IsString() @MinLength(1)
  authorTeamMemberId?: string;

  @IsOptional() @IsEnum(InsightsPostStatus)
  status?: InsightsPostStatus;

  @IsOptional() @IsDateString()
  publishedAt?: string;
}

/**
 * Spec requires articles published with status=PUBLISHED to be at least
 * 1500 words. We split the body on whitespace; rough but matches the
 * editorial intent (it's a guardrail, not a hyphenation contest).
 */
export function wordCount(body: string): number {
  return body
    .replace(/<[^>]*>/g, ' ') // strip any markup
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}
export const MIN_PUBLISHED_WORDS = 1500;
