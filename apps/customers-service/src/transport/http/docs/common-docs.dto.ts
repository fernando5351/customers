import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorDetailDto {
  @ApiProperty({ example: 'taxRoles.0.taxRoleId' })
  path: string;

  @ApiProperty({ example: '"taxRoleId" must be a valid GUID' })
  message: string;
}

export class BadRequestErrorResponseDto {
  @ApiProperty({ example: 'Invalid customer payload' })
  message: string;

  @ApiProperty({ type: () => [ValidationErrorDetailDto] })
  details: ValidationErrorDetailDto[];
}

export class NotFoundErrorResponseDto {
  @ApiProperty({ example: 'Customer 018f1d32-7b4d-7f29-9f03-b9e35d6a9f00 was not found' })
  message: string;

  @ApiProperty({ example: 'Not Found' })
  error: string;

  @ApiProperty({ example: 404 })
  statusCode: number;
}
