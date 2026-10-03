import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePriceTableDto {
  @IsString()
  @MinLength(2)
  name: string = '';

  @IsDateString()
  validFrom: string = '';

  @IsOptional()
  @IsDateString()
  validTo?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}
