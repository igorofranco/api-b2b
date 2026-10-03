import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto.js';

export class ListProductsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';

  @IsOptional()
  @IsString()
  search?: string;
}
