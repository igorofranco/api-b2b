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
import { CreateCustomerUseCase } from '../../../application/use-cases/customers/create-customer.use-case.js';
import { GetCustomerUseCase } from '../../../application/use-cases/customers/get-customer.use-case.js';
import { ListCustomersUseCase } from '../../../application/use-cases/customers/list-customers.use-case.js';
import { SetCustomerStatusUseCase } from '../../../application/use-cases/customers/set-customer-status.use-case.js';
import { UpdateCustomerUseCase } from '../../../application/use-cases/customers/update-customer.use-case.js';
import { Roles } from '../decorators/roles.decorator.js';
import { CreateCustomerDto } from '../dtos/create-customer.dto.js';
import { ListCustomersQueryDto } from '../dtos/list-customers-query.dto.js';
import { SetStatusDto } from '../dtos/set-status.dto.js';
import { UpdateCustomerDto } from '../dtos/update-customer.dto.js';

@ApiTags('customers')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly listCustomers: ListCustomersUseCase,
    private readonly getCustomer: GetCustomerUseCase,
    private readonly createCustomer: CreateCustomerUseCase,
    private readonly updateCustomer: UpdateCustomerUseCase,
    private readonly setStatus: SetCustomerStatusUseCase,
  ) {}

  @Get()
  list(@Query() query: ListCustomersQueryDto) {
    return this.listCustomers.execute({
      page: query.page,
      limit: query.limit,
      status: query.status,
      search: query.search,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.getCustomer.execute(id);
  }

  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.createCustomer.execute(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.updateCustomer.execute({
      customerId: id,
      name: dto.name,
      creditLimitCents: dto.creditLimitCents,
    });
  }

  @Patch(':id/status')
  async changeStatus(@Param('id') id: string, @Body() dto: SetStatusDto) {
    await this.setStatus.execute({ customerId: id, status: dto.status });
    return this.getCustomer.execute(id);
  }
}
