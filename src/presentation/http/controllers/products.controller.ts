import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateProductUseCase } from '../../../application/use-cases/products/create-product.use-case.js';
import { GetProductUseCase } from '../../../application/use-cases/products/get-product.use-case.js';
import { ListProductsUseCase } from '../../../application/use-cases/products/list-products.use-case.js';
import { SetProductStatusUseCase } from '../../../application/use-cases/products/set-product-status.use-case.js';
import { UpdateProductUseCase } from '../../../application/use-cases/products/update-product.use-case.js';
import { Roles } from '../decorators/roles.decorator.js';
import { CreateProductDto } from '../dtos/create-product.dto.js';
import { ListProductsQueryDto } from '../dtos/list-products-query.dto.js';
import { SetStatusDto } from '../dtos/set-status.dto.js';
import { UpdateProductDto } from '../dtos/update-product.dto.js';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(
    private readonly listProducts: ListProductsUseCase,
    private readonly getProduct: GetProductUseCase,
    private readonly createProduct: CreateProductUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly setStatus: SetProductStatusUseCase,
  ) {}

  @Get()
  list(@Query() query: ListProductsQueryDto) {
    return this.listProducts.execute({
      page: query.page,
      limit: query.limit,
      status: query.status,
      search: query.search,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.getProduct.execute(id);
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.createProduct.execute(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.updateProduct.execute({
      productId: id,
      name: dto.name,
      description: dto.description,
      unit: dto.unit,
      basePriceCents: dto.basePriceCents,
    });
  }

  @Roles('ADMIN')
  @Patch(':id/status')
  async changeStatus(@Param('id') id: string, @Body() dto: SetStatusDto) {
    await this.setStatus.execute({ productId: id, status: dto.status });
    return this.getProduct.execute(id);
  }
}
