import { IsInt, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MinLength(2)
  name: string = '';

  @IsString()
  cnpj: string = '';

  @IsInt()
  @Min(0)
  creditLimitCents: number = 0;

  @IsUUID()
  priceTableId: string = '';
}
