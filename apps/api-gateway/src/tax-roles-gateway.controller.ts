import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MESSAGE_PATTERNS, sendRpc, SERVICE_NAMES } from '@takumi/common';

@Controller('customers/tax-roles')
export class TaxRolesGatewayController {
  constructor(@Inject(SERVICE_NAMES.CUSTOMERS) private readonly customers: ClientProxy) {}

  @Post()
  create(@Body() body: unknown) {
    return sendRpc(this.customers, MESSAGE_PATTERNS.customers.taxRoles.create, body);
  }

  @Get()
  list(@Query() query: Record<string, unknown>) {
    return sendRpc(this.customers, MESSAGE_PATTERNS.customers.taxRoles.list, query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return sendRpc(this.customers, MESSAGE_PATTERNS.customers.taxRoles.findById, { id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return sendRpc(this.customers, MESSAGE_PATTERNS.customers.taxRoles.update, {
      ...body,
      id,
    });
  }
}
