import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class PriceTableItemDto {
  @IsUUID()
  productId: string = '';

  @IsInt()
  @Min(1)
  priceCents: number = 0;
}

export class SetPriceTableItemsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PriceTableItemDto)
  items: PriceTableItemDto[] = [];
}
