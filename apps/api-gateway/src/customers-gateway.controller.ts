import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MESSAGE_PATTERNS, sendRpc, SERVICE_NAMES } from '@takumi/common';

@Controller('customers')
export class CustomersGatewayController {
  constructor(@Inject(SERVICE_NAMES.CUSTOMERS) private readonly customers: ClientProxy) {}

  @Get('health')
  health() {
    return sendRpc(this.customers, MESSAGE_PATTERNS.customers.health, {});
  }

  @Post()
  create(@Body() body: unknown) {
    return sendRpc(this.customers, MESSAGE_PATTERNS.customers.create, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return sendRpc(this.customers, MESSAGE_PATTERNS.customers.update, {
      ...body,
      id,
    });
  }

  @Get()
  list(@Query() query: Record<string, unknown>) {
    return sendRpc(this.customers, MESSAGE_PATTERNS.customers.list, query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return sendRpc(this.customers, MESSAGE_PATTERNS.customers.findById, { id });
  }
}
