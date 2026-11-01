import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCustomerInput, UpdateCustomerInput } from '../../application/dto/customer.dto';
import {
  CustomerIdentificationType,
  InstitutionalSector,
  TaxpayerCategory,
  VatStatus,
} from '../entities';

@Injectable()
export class CustomerFiscalValidator {
  validate(dto: CreateCustomerInput | UpdateCustomerInput): void {
    this.validateInstitutionalProfile(dto);
    this.validateTaxProfile(dto);
    this.validateIdentifications(dto);
    this.validateTaxRoles(dto);
  }

  private validateInstitutionalProfile(dto: CreateCustomerInput | UpdateCustomerInput): void {
    const publicEntitySector = [InstitutionalSector.PUBLIC, InstitutionalSector.GOVERNMENTAL].includes(
      dto.institutionalSector ?? InstitutionalSector.NOT_APPLICABLE,
    );

    if (publicEntitySector && !dto.publicEntityType) {
      throw new BadRequestException(
        'Las entidades públicas o gubernamentales deben indicar el tipo de entidad pública.',
      );
    }

    if (!publicEntitySector && dto.publicEntityType) {
      throw new BadRequestException(
        'El tipo de entidad pública solo aplica al sector público o gubernamental.',
      );
    }
  }

  private validateTaxProfile(dto: CreateCustomerInput | UpdateCustomerInput): void {
    if (!dto.taxProfile) {
      return;
    }

    const { vatStatus, taxpayerCategory } = dto.taxProfile;

    if (
      vatStatus !== VatStatus.VAT_TAXPAYER &&
      taxpayerCategory !== TaxpayerCategory.NOT_APPLICABLE &&
      taxpayerCategory !== TaxpayerCategory.UNKNOWN
    ) {
      throw new BadRequestException(
        'La categoría fiscal solo aplica a contribuyentes de IVA.',
      );
    }

    if (
      vatStatus === VatStatus.VAT_TAXPAYER &&
      taxpayerCategory === TaxpayerCategory.NOT_APPLICABLE
    ) {
      throw new BadRequestException('Un contribuyente de IVA debe tener una categoría fiscal.');
    }
  }

  private validateIdentifications(dto: CreateCustomerInput | UpdateCustomerInput): void {
    const identifications = dto.identifications ?? [];
    const hasNrc = identifications.some((item) => item.type === CustomerIdentificationType.NRC);
    const vatStatus = dto.taxProfile?.vatStatus;

    if (vatStatus === VatStatus.VAT_TAXPAYER && !hasNrc) {
      throw new BadRequestException('Un contribuyente de IVA debe registrar NRC.');
    }

    if (hasNrc && vatStatus !== VatStatus.VAT_TAXPAYER) {
      throw new BadRequestException(
        'Un cliente con NRC debe registrarse como contribuyente de IVA.',
      );
    }

    const identificationKeys = identifications.map(
      (item) => `${item.type}:${normalizeIdentificationValue(item.type, item.value)}`,
    );

    if (new Set(identificationKeys).size !== identificationKeys.length) {
      throw new BadRequestException('No se pueden registrar identificaciones duplicadas.');
    }
  }

  private validateTaxRoles(dto: CreateCustomerInput | UpdateCustomerInput): void {
    const roleIds = dto.taxRoles?.map((role) => role.taxRoleId) ?? [];

    if (new Set(roleIds).size !== roleIds.length) {
      throw new BadRequestException('No se puede registrar dos veces el mismo rol fiscal.');
    }
  }
}

function normalizeIdentificationValue(type: CustomerIdentificationType, value: string): string {
  const normalized = value.trim().toUpperCase();

  switch (type) {
    case CustomerIdentificationType.DUI:
    case CustomerIdentificationType.NIT:
    case CustomerIdentificationType.NRC:
      return normalized.replace(/[^0-9]/g, '');

    default:
      return normalized.replace(/\s+/g, '');
  }
}
