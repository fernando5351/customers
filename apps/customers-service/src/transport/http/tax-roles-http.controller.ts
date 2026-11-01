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
import {
  CreateTaxRoleInput,
  ListTaxRolesInput,
  UpdateTaxRoleInput,
} from '../../application/dto/tax-role.dto';
import { TaxRolesService } from '../../application/tax-roles.service';
import {
  BadRequestErrorResponseDto,
  NotFoundErrorResponseDto,
} from './docs/common-docs.dto';
import { TaxRoleCatalogResponseDto } from './docs/customer-docs.dto';
import {
  CreateTaxRoleRequestDto,
  ListTaxRolesResponseDto,
  UpdateTaxRoleRequestDto,
} from './docs/tax-role-docs.dto';

@ApiTags('Tax Roles')
@Controller('tax-roles')
export class TaxRolesHttpController {
  constructor(private readonly taxRoles: TaxRolesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create tax role catalog item',
    description: 'Creates a fiscal role in the catalog, such as VAT withholding agent.',
  })
  @ApiBody({ type: CreateTaxRoleRequestDto })
  @ApiCreatedResponse({ type: TaxRoleCatalogResponseDto })
  @ApiBadRequestResponse({ type: BadRequestErrorResponseDto })
  create(@Body() body: CreateTaxRoleInput) {
    return this.taxRoles.create(body);
  }

  @Get()
  @ApiOperation({
    summary: 'List tax role catalog',
    description: 'Returns paginated tax roles available to assign to customers.',
  })
  @ApiQuery({ name: 'search', required: false, example: 'retención' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 25 })
  @ApiQuery({ name: 'includeInactive', required: false, example: false })
  @ApiOkResponse({ type: ListTaxRolesResponseDto })
  @ApiBadRequestResponse({ type: BadRequestErrorResponseDto })
  list(@Query() query: ListTaxRolesInput) {
    return this.taxRoles.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tax role catalog item by id' })
  @ApiParam({ name: 'id', example: '018f1d32-7b4d-7f29-9f03-b9e35d6a9f11' })
  @ApiOkResponse({ type: TaxRoleCatalogResponseDto })
  @ApiBadRequestResponse({ type: BadRequestErrorResponseDto })
  @ApiNotFoundResponse({ type: NotFoundErrorResponseDto })
  findById(@Param('id') id: string) {
    return this.taxRoles.findById({ id });
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update tax role catalog item',
    description: 'Updates catalog metadata or activates/deactivates a tax role.',
  })
  @ApiParam({ name: 'id', example: '018f1d32-7b4d-7f29-9f03-b9e35d6a9f11' })
  @ApiBody({ type: UpdateTaxRoleRequestDto })
  @ApiOkResponse({ type: TaxRoleCatalogResponseDto })
  @ApiBadRequestResponse({ type: BadRequestErrorResponseDto })
  @ApiNotFoundResponse({ type: NotFoundErrorResponseDto })
  update(@Param('id') id: string, @Body() body: Omit<UpdateTaxRoleInput, 'id'>) {
    return this.taxRoles.update({
      ...body,
      id,
    });
  }
}
