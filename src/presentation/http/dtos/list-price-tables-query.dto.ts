import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto.js';

export class ListPriceTablesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}
