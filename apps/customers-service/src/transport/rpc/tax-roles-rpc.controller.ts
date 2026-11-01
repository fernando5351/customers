import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MESSAGE_PATTERNS } from '@takumi/common';
import {
  CreateTaxRoleInput,
  GetTaxRoleByIdInput,
  ListTaxRolesInput,
  UpdateTaxRoleInput,
} from '../../application/dto/tax-role.dto';
import { TaxRolesService } from '../../application/tax-roles.service';

@Controller()
export class TaxRolesRpcController {
  constructor(private readonly taxRoles: TaxRolesService) {}

  @MessagePattern(MESSAGE_PATTERNS.customers.taxRoles.create)
  create(@Payload() payload: CreateTaxRoleInput) {
    return this.taxRoles.create(payload);
  }

  @MessagePattern(MESSAGE_PATTERNS.customers.taxRoles.update)
  update(@Payload() payload: UpdateTaxRoleInput) {
    return this.taxRoles.update(payload);
  }

  @MessagePattern(MESSAGE_PATTERNS.customers.taxRoles.findById)
  findById(@Payload() payload: GetTaxRoleByIdInput) {
    return this.taxRoles.findById(payload);
  }

  @MessagePattern(MESSAGE_PATTERNS.customers.taxRoles.list)
  list(@Payload() payload: ListTaxRolesInput) {
    return this.taxRoles.list(payload);
  }
}
