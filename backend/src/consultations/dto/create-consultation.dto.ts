import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ChallengeCategory } from '@prisma/client';

/**
 * Inbound payload for `POST /api/consultations`.
 *
 * Fields are validated by class-validator at the global pipe; free-text
 * fields are then sanitised in the controller before being passed to the
 * service (see ConsultationsController). Validation errors return inline
 * field-level details so the front-end can render them next to the
 * relevant inputs.
 */
export class CreateConsultationDto {
  // Step 1
  @IsString()
  @MinLength(1, { message: 'Full name is required' })
  @MaxLength(200)
  fullName!: string;

  @IsString()
  @MinLength(1, { message: 'Organization is required' })
  @MaxLength(200)
  organization!: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  @MaxLength(254)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  // Step 2
  @IsOptional()
  @IsString()
  @MaxLength(64)
  primaryServiceSlug?: string;

  @IsArray({ message: 'Please select at least one challenge category' })
  @ArrayMinSize(1, { message: 'Please select at least one challenge category' })
  @ArrayUnique()
  @IsEnum(ChallengeCategory, { each: true })
  challengeCategories!: ChallengeCategory[];

  @IsString()
  @MinLength(1, { message: 'Please describe your situation' })
  @MaxLength(5000)
  situationDescription!: string;
}
