import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CustomersService } from '../../application/customers.service';
import {
  CreateCustomerInput,
  GetCustomerByIdInput,
  ListCustomersInput,
  UpdateCustomerInput,
} from '../../application/dto/customer.dto';
import {
  BadRequestErrorResponseDto,
  NotFoundErrorResponseDto,
} from './docs/common-docs.dto';
import {
  CreateCustomerRequestDto,
  CustomerResponseDto,
  CustomersHealthResponseDto,
  ListCustomersResponseDto,
  UpdateCustomerRequestDto,
} from './docs/customer-docs.dto';
import { CustomerNature as CustomerNatureDoc } from '../../domain/entities';

@ApiTags('Customers')
@Controller('customers')
export class CustomersHttpController {
  constructor(private readonly customers: CustomersService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Check customers microservice health',
    description: 'Returns customers-service status and the current amount of customers.',
  })
  @ApiOkResponse({ type: CustomersHealthResponseDto })
  health() {
    return this.customers.health();
  }

  @Post()
  @ApiOperation({
    summary: 'Create customer',
    description:
      'Creates a customer with optional identifications, tax profile, fiscal role assignments and company links.',
  })
  @ApiBody({ type: CreateCustomerRequestDto })
  @ApiCreatedResponse({ type: CustomerResponseDto })
  @ApiBadRequestResponse({ type: BadRequestErrorResponseDto })
  create(@Body() body: CreateCustomerInput) {
    return this.customers.create(body);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update customer',
    description:
      'Updates only supplied fields. Supplied collections replace the current collection; an empty array clears it. Omitted collections remain unchanged. A null taxProfile removes the profile.',
  })
  @ApiParam({ name: 'id', example: '018f1d32-7b4d-7f29-9f03-b9e35d6a9f00' })
  @ApiBody({ type: UpdateCustomerRequestDto })
  @ApiOkResponse({ type: CustomerResponseDto })
  @ApiBadRequestResponse({ type: BadRequestErrorResponseDto })
  @ApiNotFoundResponse({ type: NotFoundErrorResponseDto })
  update(@Param('id') id: string, @Body() body: Omit<UpdateCustomerInput, 'id'>) {
    return this.customers.update({
      ...body,
      id,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'List customers',
    description:
      'Returns paginated customers. Search matches legalName, tradeName, email, phone and identifications.',
  })
  @ApiQuery({ name: 'companyId', required: false, example: '018f1d32-7b4d-7f29-9f03-b9e35d6a9f22' })
  @ApiQuery({ name: 'search', required: false, example: 'Ministerio, 06140106110022, correo@dominio.com' })
  @ApiQuery({ name: 'nature', required: false, enum: CustomerNatureDoc, example: CustomerNatureDoc.NATURAL_PERSON })
  @ApiQuery({ name: 'isActive', required: false, example: true })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 25 })
  @ApiQuery({ name: 'includeInactive', required: false, example: false })
  @ApiOkResponse({ type: ListCustomersResponseDto })
  @ApiBadRequestResponse({ type: BadRequestErrorResponseDto })
  list(@Query() query: ListCustomersInput) {
    return this.customers.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by id' })
  @ApiParam({ name: 'id', example: '018f1d32-7b4d-7f29-9f03-b9e35d6a9f00' })
  @ApiOkResponse({ type: CustomerResponseDto })
  @ApiBadRequestResponse({ type: BadRequestErrorResponseDto })
  @ApiNotFoundResponse({ type: NotFoundErrorResponseDto })
  findById(@Param('id') id: string) {
    return this.customers.findById({ id } satisfies GetCustomerByIdInput);
  }
}
