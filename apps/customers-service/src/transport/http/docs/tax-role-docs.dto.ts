import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationResponseDto, TaxRoleCatalogResponseDto } from './customer-docs.dto';

export class CreateTaxRoleRequestDto {
  @ApiProperty({
    example: 'VAT_WITHHOLDING_AGENT',
    description: 'Stable catalog code used by business rules and frontend selection lists.',
    maxLength: 50,
  })
  code: string;

  @ApiProperty({ example: 'Agente de retención de IVA', maxLength: 150 })
  name: string;

  @ApiPropertyOptional({
    example: 'Cliente autorizado para retener IVA.',
    maxLength: 500,
    nullable: true,
  })
  description?: string | null;

  @ApiPropertyOptional({
    type: Number,
    example: 0.01,
    description: 'Default fiscal rate for this role. Customer assignments may override it.',
    nullable: true,
  })
  defaultRate?: number | null;

  @ApiPropertyOptional({ example: 'Resolución MH', maxLength: 250, nullable: true })
  legalBasis?: string | null;

  @ApiPropertyOptional({
    example: false,
    default: false,
    description: 'Marks roles seeded or owned by the platform.',
  })
  isSystem?: boolean | null;
}

export class UpdateTaxRoleRequestDto {
  @ApiPropertyOptional({ example: 'VAT_WITHHOLDING_AGENT', maxLength: 50 })
  code?: string | null;

  @ApiPropertyOptional({ example: 'Agente de retención de IVA', maxLength: 150 })
  name?: string | null;

  @ApiPropertyOptional({ example: 'Cliente autorizado para retener IVA.', nullable: true })
  description?: string | null;

  @ApiPropertyOptional({ type: Number, example: 0.01, nullable: true })
  defaultRate?: number | null;

  @ApiPropertyOptional({ example: 'Resolución MH', nullable: true })
  legalBasis?: string | null;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean | null;
}

export class ListTaxRolesResponseDto {
  @ApiProperty({ type: () => [TaxRoleCatalogResponseDto] })
  data: TaxRoleCatalogResponseDto[];

  @ApiProperty({ type: () => PaginationResponseDto })
  pagination: PaginationResponseDto;
}
