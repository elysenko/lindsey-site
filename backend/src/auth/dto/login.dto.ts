import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email or password' })
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(1, { message: 'Invalid email or password' })
  @MaxLength(256)
  password!: string;
}
