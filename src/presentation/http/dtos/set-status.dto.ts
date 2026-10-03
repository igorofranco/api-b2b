import { IsIn } from 'class-validator';

export class SetStatusDto {
  @IsIn(['ACTIVE', 'INACTIVE'])
  status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE';
}
