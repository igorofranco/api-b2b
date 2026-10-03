import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetPriceTableUseCase } from '../../../application/use-cases/price-tables/get-price-table.use-case.js';
import { ListPriceTablesUseCase } from '../../../application/use-cases/price-tables/list-price-tables.use-case.js';
import {
  CreatePriceTableUseCase,
  SetPriceTableItemsUseCase,
} from '../../../application/use-cases/price-tables/price-table.use-cases.js';
import { Roles } from '../decorators/roles.decorator.js';
import { CreatePriceTableDto } from '../dtos/create-price-table.dto.js';
import { ListPriceTablesQueryDto } from '../dtos/list-price-tables-query.dto.js';
import { SetPriceTableItemsDto } from '../dtos/set-price-table-items.dto.js';

@ApiTags('price-tables')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('price-tables')
export class PriceTablesController {
  constructor(
    private readonly listPriceTables: ListPriceTablesUseCase,
    private readonly getPriceTable: GetPriceTableUseCase,
    private readonly createPriceTable: CreatePriceTableUseCase,
    private readonly setItems: SetPriceTableItemsUseCase,
  ) {}

  @Get()
  list(@Query() query: ListPriceTablesQueryDto) {
    return this.listPriceTables.execute({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.getPriceTable.execute(id);
  }

  @Post()
  async create(@Body() dto: CreatePriceTableDto) {
    const id = await this.createPriceTable.execute({
      name: dto.name,
      currency: dto.currency,
      validFrom: new Date(dto.validFrom),
      validTo: dto.validTo ? new Date(dto.validTo) : null,
    });
    return this.getPriceTable.execute(id);
  }

  @Put(':id/items')
  async replaceItems(
    @Param('id') id: string,
    @Body() dto: SetPriceTableItemsDto,
  ) {
    await this.setItems.execute({ priceTableId: id, items: dto.items });
    return this.getPriceTable.execute(id);
  }
}
