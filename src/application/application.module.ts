import { Module } from '@nestjs/common';
import { PersistenceModule } from '../infra/persistence.module.js';
import { CreateCustomerUseCase } from './use-cases/customers/create-customer.use-case.js';
import { SetCustomerStatusUseCase } from './use-cases/customers/set-customer-status.use-case.js';
import { UpdateCreditLimitUseCase } from './use-cases/customers/update-credit-limit.use-case.js';
import { CreateProductUseCase } from './use-cases/products/create-product.use-case.js';
import { SetProductStatusUseCase } from './use-cases/products/set-product-status.use-case.js';
import {
  CreatePriceTableUseCase,
  SetPriceTableItemsUseCase,
} from './use-cases/price-tables/price-table.use-cases.js';
import { CreateOrderUseCase } from './use-cases/orders/create-order.use-case.js';
import { ApproveOrderUseCase } from './use-cases/orders/approve-order.use-case.js';
import { RejectOrderUseCase } from './use-cases/orders/reject-order.use-case.js';
import { CancelOrderUseCase } from './use-cases/orders/cancel-order.use-case.js';
import { GetOrderUseCase } from './use-cases/orders/get-order.use-case.js';
import { CalculateCustomerExposureUseCase } from './use-cases/orders/calculate-customer-exposure.use-case.js';

const USE_CASES = [
  CreateCustomerUseCase,
  SetCustomerStatusUseCase,
  UpdateCreditLimitUseCase,
  CreateProductUseCase,
  SetProductStatusUseCase,
  CreatePriceTableUseCase,
  SetPriceTableItemsUseCase,
  CreateOrderUseCase,
  ApproveOrderUseCase,
  RejectOrderUseCase,
  CancelOrderUseCase,
  GetOrderUseCase,
  CalculateCustomerExposureUseCase,
];

@Module({
  imports: [PersistenceModule],
  providers: [...USE_CASES],
  exports: [...USE_CASES, PersistenceModule],
})
export class ApplicationModule {}
