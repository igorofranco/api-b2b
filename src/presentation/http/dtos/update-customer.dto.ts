import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  creditLimitCents?: number;
}
