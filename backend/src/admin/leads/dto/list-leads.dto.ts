import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BriefStatus, ChallengeCategory, LeadStatus } from '@prisma/client';

export type LeadSort =
  | 'createdAt:desc'
  | 'createdAt:asc'
  | 'organization:asc'
  | 'organization:desc';

export class ListLeadsDto {
  @IsOptional()
  @IsEnum(ChallengeCategory)
  challengeCategory?: ChallengeCategory;

  @IsOptional()
  @IsEnum(LeadStatus)
  leadStatus?: LeadStatus;

  @IsOptional()
  @IsEnum(BriefStatus)
  briefStatus?: BriefStatus;

  @IsOptional()
  @IsString()
  sort?: LeadSort;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 25;
}
