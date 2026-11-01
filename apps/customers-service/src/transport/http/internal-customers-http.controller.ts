import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { InternalApiKeyGuard } from '@takumi/common';
import { CustomersService } from '../../application/customers.service';
import { CustomerResponseDto } from './docs/customer-docs.dto';
import { NotFoundErrorResponseDto } from './docs/common-docs.dto';

@ApiTags('Internal customers')
@Controller('internal/customers')
@UseGuards(InternalApiKeyGuard)
export class InternalCustomersHttpController {
  constructor(private readonly customers: CustomersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get customer for trusted server-to-server callers' })
  @ApiHeader({ name: 'X-Internal-Api-Key', required: true })
  @ApiOkResponse({ type: CustomerResponseDto })
  @ApiNotFoundResponse({ type: NotFoundErrorResponseDto })
  findById(@Param('id') id: string) {
    return this.customers.findByIdInternal({ id });
  }
}
