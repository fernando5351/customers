import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InternalApiKeyGuard, MESSAGE_PATTERNS, sendRpc, SERVICE_NAMES } from '@takumi/common';

@Controller('internal/customers')
@UseGuards(InternalApiKeyGuard)
export class InternalCustomersGatewayController {
  constructor(@Inject(SERVICE_NAMES.CUSTOMERS) private readonly customers: ClientProxy) {}

  @Get(':id')
  findById(@Param('id') id: string) {
    return sendRpc(this.customers, MESSAGE_PATTERNS.customers.internalById, { id });
  }
}