import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Brand Intelligence Brief — every field is optional, but at least one
 * must be present. The class-validator config below permits any subset of
 * fields, and the service layer rejects an entirely empty payload.
 */
export class UpsertBriefDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  missionStatement?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  visionStatement?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  differentiator?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  brandStory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  audiences?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  voiceDescriptors?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  successDefinition?: string;
}
