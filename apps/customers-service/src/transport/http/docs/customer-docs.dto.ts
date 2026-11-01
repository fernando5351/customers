import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  CustomerIdentificationType as CustomerIdentificationTypeDoc,
  CustomerNature as CustomerNatureDoc,
  CustomerTaxRoleStatus as CustomerTaxRoleStatusDoc,
  InstitutionalSector as InstitutionalSectorDoc,
  PublicEntityType as PublicEntityTypeDoc,
  TaxpayerCategory as TaxpayerCategoryDoc,
  VatStatus as VatStatusDoc,
} from '../../../domain/entities';

export class CreateCustomerIdentificationRequestDto {
  @ApiProperty({ enum: CustomerIdentificationTypeDoc, example: CustomerIdentificationTypeDoc.NRC })
  type: CustomerIdentificationTypeDoc;

  @ApiProperty({ example: '123456-7', maxLength: 50 })
  value: string;

  @ApiPropertyOptional({
    example: '1234567',
    maxLength: 50,
    description: 'If omitted, the service normalizes value automatically.',
  })
  normalizedValue?: string | null;

  @ApiPropertyOptional({ example: 'SV', default: 'SV', minLength: 2, maxLength: 2 })
  countryId?: string | null;

  @ApiPropertyOptional({ example: true, default: false })
  isPrimary?: boolean | null;

  @ApiPropertyOptional({ example: '2026-08-07T10:30:00.000Z', nullable: true })
  verifiedAt?: string | null;
}

export class CreateCustomerTaxProfileRequestDto {
  @ApiProperty({ enum: VatStatusDoc, example: VatStatusDoc.VAT_TAXPAYER })
  vatStatus: VatStatusDoc;

  @ApiPropertyOptional({
    enum: TaxpayerCategoryDoc,
    example: TaxpayerCategoryDoc.OTHER,
    default: TaxpayerCategoryDoc.NOT_APPLICABLE,
  })
  taxpayerCategory?: TaxpayerCategoryDoc | null;

  @ApiPropertyOptional({ example: '620100', maxLength: 6, nullable: true })
  economicActivityId?: string | null;

  @ApiPropertyOptional({
    example: 'Actividades de programación informática',
    maxLength: 250,
    nullable: true,
  })
  economicActivityDescription?: string | null;

  @ApiPropertyOptional({ example: '2026-08-07T10:30:00.000Z', nullable: true })
  verifiedAt?: string | null;

  @ApiPropertyOptional({ example: 'Consulta interna / Hacienda', maxLength: 250, nullable: true })
  verificationSource?: string | null;

  @ApiPropertyOptional({ example: 'Perfil tributario verificado manualmente.', nullable: true })
  notes?: string | null;
}

export class CreateCustomerTaxRoleAssignmentRequestDto {
  @ApiProperty({
    example: '018f1d32-7b4d-7f29-9f03-b9e35d6a9f11',
    description: 'Identifier from the tax role catalog.',
  })
  taxRoleId: string;

  @ApiPropertyOptional({
    enum: CustomerTaxRoleStatusDoc,
    example: CustomerTaxRoleStatusDoc.ACTIVE,
    default: CustomerTaxRoleStatusDoc.PENDING_VERIFICATION,
  })
  status?: CustomerTaxRoleStatusDoc | null;

  @ApiPropertyOptional({
    type: Number,
    example: 0.01,
    description: 'Customer-specific rate. If omitted, clients may use the catalog defaultRate.',
    nullable: true,
  })
  rate?: number | null;

  @ApiPropertyOptional({ example: 'RET-2026-001234', maxLength: 100, nullable: true })
  resolutionNumber?: string | null;

  @ApiPropertyOptional({ example: '2026-01-01', nullable: true })
  validFrom?: string | null;

  @ApiPropertyOptional({ example: '2026-12-31', nullable: true })
  validUntil?: string | null;

  @ApiPropertyOptional({ example: 'Resolución emitida por Hacienda', maxLength: 250, nullable: true })
  verificationSource?: string | null;

  @ApiPropertyOptional({ example: '2026-08-07T10:30:00.000Z', nullable: true })
  verifiedAt?: string | null;

  @ApiPropertyOptional({ example: 'Rol fiscal confirmado.', maxLength: 500, nullable: true })
  notes?: string | null;
}

export class CreateCustomerCompanyRequestDto {
  @ApiProperty({ example: '018f1d32-7b4d-7f29-9f03-b9e35d6a9f22' })
  companyId: string;
}

export class CreateCustomerRequestDto {
  @ApiProperty({ enum: CustomerNatureDoc, example: CustomerNatureDoc.LEGAL_ENTITY })
  nature: CustomerNatureDoc;

  @ApiPropertyOptional({
    enum: InstitutionalSectorDoc,
    example: InstitutionalSectorDoc.PUBLIC,
    default: InstitutionalSectorDoc.NOT_APPLICABLE,
  })
  institutionalSector?: InstitutionalSectorDoc | null;

  @ApiPropertyOptional({ enum: PublicEntityTypeDoc, example: PublicEntityTypeDoc.MINISTRY })
  publicEntityType?: PublicEntityTypeDoc | null;

  @ApiProperty({ example: 'Ministerio de Hacienda', maxLength: 200 })
  legalName: string;

  @ApiPropertyOptional({ example: 'Hacienda', maxLength: 200, nullable: true })
  tradeName?: string | null;

  @ApiPropertyOptional({ example: 'SV', default: 'SV', minLength: 2, maxLength: 2 })
  countryId?: string | null;

  @ApiPropertyOptional({ example: '06', maxLength: 2, nullable: true })
  departmentId?: string | null;

  @ApiPropertyOptional({ example: '0614', maxLength: 36, nullable: true })
  municipalityId?: string | null;

  @ApiPropertyOptional({ example: 'San Salvador, El Salvador', maxLength: 300, nullable: true })
  addressComplement?: string | null;

  @ApiPropertyOptional({ example: '+503 2222-2222', maxLength: 30, nullable: true })
  phone?: string | null;

  @ApiPropertyOptional({ example: 'contacto@cliente.gob.sv', maxLength: 150, nullable: true })
  email?: string | null;

  @ApiPropertyOptional({ type: () => [CreateCustomerIdentificationRequestDto], default: [] })
  identifications?: CreateCustomerIdentificationRequestDto[] | null;

  @ApiPropertyOptional({ type: () => CreateCustomerTaxProfileRequestDto, nullable: true })
  taxProfile?: CreateCustomerTaxProfileRequestDto | null;

  @ApiPropertyOptional({ type: () => [CreateCustomerTaxRoleAssignmentRequestDto], default: [] })
  taxRoles?: CreateCustomerTaxRoleAssignmentRequestDto[] | null;

  @ApiPropertyOptional({ type: () => [CreateCustomerCompanyRequestDto], default: [] })
  companies?: CreateCustomerCompanyRequestDto[] | null;
}

export class UpdateCustomerRequestDto extends PartialType(CreateCustomerRequestDto) {}

export class CustomerIdentificationResponseDto {
  @ApiProperty({ example: '018f1d32-7b4d-7f29-9f03-b9e35d6a9f01' })
  id: string;

  @ApiProperty({ enum: CustomerIdentificationTypeDoc })
  type: CustomerIdentificationTypeDoc;

  @ApiProperty({ example: '123456-7' })
  value: string;

  @ApiProperty({ example: '1234567' })
  normalizedValue: string;

  @ApiProperty({ example: 'SV' })
  countryId: string;

  @ApiProperty({ example: true })
  isPrimary: boolean;

  @ApiProperty({ example: '2026-08-07T10:30:00.000Z', nullable: true })
  verifiedAt: string | null;
}

export class CustomerTaxProfileResponseDto {
  @ApiProperty({ example: '018f1d32-7b4d-7f29-9f03-b9e35d6a9f02' })
  id: string;

  @ApiProperty({ enum: VatStatusDoc })
  vatStatus: VatStatusDoc;

  @ApiProperty({ enum: TaxpayerCategoryDoc })
  taxpayerCategory: TaxpayerCategoryDoc;

  @ApiProperty({ example: '620100', nullable: true })
  economicActivityId: string | null;

  @ApiProperty({ example: 'Actividades de programación informática', nullable: true })
  economicActivityDescription: string | null;

  @ApiProperty({ example: '2026-08-07T10:30:00.000Z', nullable: true })
  verifiedAt: string | null;

  @ApiProperty({ example: 'Consulta interna / Hacienda', nullable: true })
  verificationSource: string | null;

  @ApiProperty({ example: 'Perfil tributario verificado.', nullable: true })
  notes: string | null;
}

export class TaxRoleCatalogResponseDto {
  @ApiProperty({ example: '018f1d32-7b4d-7f29-9f03-b9e35d6a9f11' })
  id: string;

  @ApiProperty({ example: 'VAT_WITHHOLDING_AGENT' })
  code: string;

  @ApiProperty({ example: 'Agente de retención de IVA' })
  name: string;

  @ApiProperty({ example: 'Cliente autorizado para retener IVA.', nullable: true })
  description: string | null;

  @ApiProperty({ type: Number, example: 0.01, nullable: true })
  defaultRate: number | null;

  @ApiProperty({ example: 'Resolución MH', nullable: true })
  legalBasis: string | null;

  @ApiProperty({ example: false })
  isSystem: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-08-07T10:30:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-07T10:30:00.000Z', nullable: true })
  updatedAt: string | null;
}

export class CustomerTaxRoleAssignmentResponseDto {
  @ApiProperty({ example: '018f1d32-7b4d-7f29-9f03-b9e35d6a9f03' })
  id: string;

  @ApiProperty({ example: '018f1d32-7b4d-7f29-9f03-b9e35d6a9f11' })
  taxRoleId: string;

  @ApiProperty({ type: () => TaxRoleCatalogResponseDto, nullable: true })
  taxRole: TaxRoleCatalogResponseDto | null;

  @ApiProperty({ enum: CustomerTaxRoleStatusDoc })
  status: CustomerTaxRoleStatusDoc;

  @ApiProperty({ type: Number, example: 0.01, nullable: true })
  rate: number | null;

  @ApiProperty({ example: 'RET-2026-001234', nullable: true })
  resolutionNumber: string | null;

  @ApiProperty({ example: '2026-01-01', nullable: true })
  validFrom: string | null;

  @ApiProperty({ example: '2026-12-31', nullable: true })
  validUntil: string | null;

  @ApiProperty({ example: 'Resolución emitida por Hacienda', nullable: true })
  verificationSource: string | null;

  @ApiProperty({ example: '2026-08-07T10:30:00.000Z', nullable: true })
  verifiedAt: string | null;

  @ApiProperty({ example: 'Rol fiscal confirmado.', nullable: true })
  notes: string | null;
}

export class CustomerCompanyResponseDto {
  @ApiProperty({ example: '018f1d32-7b4d-7f29-9f03-b9e35d6a9f04' })
  id: string;

  @ApiProperty({ example: '018f1d32-7b4d-7f29-9f03-b9e35d6a9f22' })
  companyId: string;
}

export class CustomerResponseDto {
  @ApiProperty({ example: '018f1d32-7b4d-7f29-9f03-b9e35d6a9f00' })
  id: string;

  @ApiProperty({ enum: CustomerNatureDoc })
  nature: CustomerNatureDoc;

  @ApiProperty({ enum: InstitutionalSectorDoc })
  institutionalSector: InstitutionalSectorDoc;

  @ApiProperty({ enum: PublicEntityTypeDoc, nullable: true })
  publicEntityType: PublicEntityTypeDoc | null;

  @ApiProperty({ example: 'Ministerio de Hacienda' })
  legalName: string;

  @ApiProperty({ example: 'Hacienda', nullable: true })
  tradeName: string | null;

  @ApiProperty({ example: 'SV' })
  countryId: string;

  @ApiProperty({ example: '06', nullable: true })
  departmentId: string | null;

  @ApiProperty({ example: '0614', nullable: true })
  municipalityId: string | null;

  @ApiProperty({ example: 'San Salvador, El Salvador', nullable: true })
  addressComplement: string | null;

  @ApiProperty({ example: '+503 2222-2222', nullable: true })
  phone: string | null;

  @ApiProperty({ example: 'contacto@cliente.gob.sv', nullable: true })
  email: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-08-07T10:30:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-07T10:30:00.000Z', nullable: true })
  updatedAt: string | null;

  @ApiProperty({ type: () => [CustomerIdentificationResponseDto] })
  identifications: CustomerIdentificationResponseDto[];

  @ApiProperty({ type: () => CustomerTaxProfileResponseDto, nullable: true })
  taxProfile: CustomerTaxProfileResponseDto | null;

  @ApiProperty({ type: () => [CustomerTaxRoleAssignmentResponseDto] })
  taxRoles: CustomerTaxRoleAssignmentResponseDto[];

  @ApiProperty({ type: () => [CustomerCompanyResponseDto] })
  companies: CustomerCompanyResponseDto[];
}

export class PaginationResponseDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 25 })
  limit: number;

  @ApiProperty({ example: 120 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class ListCustomersResponseDto {
  @ApiProperty({ type: () => [CustomerResponseDto] })
  data: CustomerResponseDto[];

  @ApiProperty({ type: () => PaginationResponseDto })
  pagination: PaginationResponseDto;
}

export class CustomersHealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({ example: 'customers-service' })
  service: string;

  @ApiProperty({ example: 42 })
  totalCustomers: number;

  @ApiProperty({ example: '2026-08-07T10:30:00.000Z' })
  timestamp: string;
}
