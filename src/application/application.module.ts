import { Module } from '@nestjs/common';
import { PersistenceModule } from '../infra/persistence.module.js';
import { SecurityModule } from '../infra/security/security.module.js';
import { AuthenticateUserUseCase } from './use-cases/auth/authenticate-user.use-case.js';
import { GetCurrentUserUseCase } from './use-cases/auth/get-current-user.use-case.js';
import { CreateCustomerUseCase } from './use-cases/customers/create-customer.use-case.js';
import { SetCustomerStatusUseCase } from './use-cases/customers/set-customer-status.use-case.js';
import { UpdateCreditLimitUseCase } from './use-cases/customers/update-credit-limit.use-case.js';
import { ListCustomersUseCase } from './use-cases/customers/list-customers.use-case.js';
import { GetCustomerUseCase } from './use-cases/customers/get-customer.use-case.js';
import { UpdateCustomerUseCase } from './use-cases/customers/update-customer.use-case.js';
import { CreateProductUseCase } from './use-cases/products/create-product.use-case.js';
import { SetProductStatusUseCase } from './use-cases/products/set-product-status.use-case.js';
import { ListProductsUseCase } from './use-cases/products/list-products.use-case.js';
import { GetProductUseCase } from './use-cases/products/get-product.use-case.js';
import { UpdateProductUseCase } from './use-cases/products/update-product.use-case.js';
import {
  CreatePriceTableUseCase,
  SetPriceTableItemsUseCase,
} from './use-cases/price-tables/price-table.use-cases.js';
import { ListPriceTablesUseCase } from './use-cases/price-tables/list-price-tables.use-case.js';
import { GetPriceTableUseCase } from './use-cases/price-tables/get-price-table.use-case.js';
import { CreateOrderUseCase } from './use-cases/orders/create-order.use-case.js';
import { ApproveOrderUseCase } from './use-cases/orders/approve-order.use-case.js';
import { RejectOrderUseCase } from './use-cases/orders/reject-order.use-case.js';
import { CancelOrderUseCase } from './use-cases/orders/cancel-order.use-case.js';
import { GetOrderUseCase } from './use-cases/orders/get-order.use-case.js';
import { CalculateCustomerExposureUseCase } from './use-cases/orders/calculate-customer-exposure.use-case.js';

const USE_CASES = [
  AuthenticateUserUseCase,
  GetCurrentUserUseCase,
  CreateCustomerUseCase,
  SetCustomerStatusUseCase,
  UpdateCreditLimitUseCase,
  ListCustomersUseCase,
  GetCustomerUseCase,
  UpdateCustomerUseCase,
  CreateProductUseCase,
  SetProductStatusUseCase,
  ListProductsUseCase,
  GetProductUseCase,
  UpdateProductUseCase,
  CreatePriceTableUseCase,
  SetPriceTableItemsUseCase,
  ListPriceTablesUseCase,
  GetPriceTableUseCase,
  CreateOrderUseCase,
  ApproveOrderUseCase,
  RejectOrderUseCase,
  CancelOrderUseCase,
  GetOrderUseCase,
  CalculateCustomerExposureUseCase,
];

@Module({
  imports: [PersistenceModule, SecurityModule],
  providers: [...USE_CASES],
  exports: [...USE_CASES, PersistenceModule, SecurityModule],
})
export class ApplicationModule {}
