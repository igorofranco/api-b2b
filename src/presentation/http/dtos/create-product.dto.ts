import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  sku: string = '';

  @IsString()
  @MinLength(2)
  name: string = '';

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MinLength(1)
  unit: string = '';

  @IsInt()
  @Min(1)
  basePriceCents: number = 0;
}
