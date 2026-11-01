import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CustomerCompanyContextGuard,
  MESSAGE_PATTERNS,
  sendRpc,
  SERVICE_NAMES,
} from '@takumi/common';

type CompanyContextRequest = {
  companyContextId: string;
};

@Controller('customers')
export class CustomersGatewayController {
  constructor(@Inject(SERVICE_NAMES.CUSTOMERS) private readonly customers: ClientProxy) {}

  @Get('health')
  health() {
    return sendRpc(this.customers, MESSAGE_PATTERNS.customers.health, {});
  }

  @UseGuards(CustomerCompanyContextGuard)
  @Post()
  create(@Body() body: unknown, @Req() request: CompanyContextRequest) {
    return sendRpc(this.customers, MESSAGE_PATTERNS.customers.create, {
      data: body,
      companyId: request.companyContextId,
    });
  }

  @UseGuards(CustomerCompanyContextGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Req() request: CompanyContextRequest,
  ) {
    return sendRpc(this.customers, MESSAGE_PATTERNS.customers.update, {
      data: { ...body, id },
      companyId: request.companyContextId,
    });
  }

  @UseGuards(CustomerCompanyContextGuard)
  @Get()
  list(@Query() query: Record<string, unknown>, @Req() request: CompanyContextRequest) {
    return sendRpc(this.customers, MESSAGE_PATTERNS.customers.list, {
      data: query,
      companyId: request.companyContextId,
    });
  }

  @UseGuards(CustomerCompanyContextGuard)
  @Get(':id')
  findById(@Param('id') id: string, @Req() request: CompanyContextRequest) {
    return sendRpc(this.customers, MESSAGE_PATTERNS.customers.findById, {
      data: { id },
      companyId: request.companyContextId,
    });
  }
}
