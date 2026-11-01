import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MESSAGE_PATTERNS } from '@takumi/common';
import { CustomersService } from '../../application/customers.service';
import {
  CreateCustomerInput,
  GetCustomerByIdInput,
  ListCustomersInput,
  UpdateCustomerInput,
} from '../../application/dto/customer.dto';

@Controller()
export class CustomersRpcController {
  constructor(private readonly customers: CustomersService) {}

  @MessagePattern(MESSAGE_PATTERNS.customers.health)
  health() {
    return this.customers.health();
  }

  @MessagePattern(MESSAGE_PATTERNS.customers.create)
  create(@Payload() payload: CreateCustomerInput) {
    return this.customers.create(payload);
  }

  @MessagePattern(MESSAGE_PATTERNS.customers.update)
  update(@Payload() payload: UpdateCustomerInput) {
    return this.customers.update(payload);
  }

  @MessagePattern(MESSAGE_PATTERNS.customers.findById)
  findById(@Payload() payload: GetCustomerByIdInput) {
    return this.customers.findById(payload);
  }

  @MessagePattern(MESSAGE_PATTERNS.customers.list)
  list(@Payload() payload: ListCustomersInput) {
    return this.customers.list(payload);
  }
}
