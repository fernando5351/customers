import { BadRequestException } from '@nestjs/common';
import { ObjectSchema } from 'joi';

export type ValidatePayloadOptions = {
  message?: string;
};

export function validatePayload<T>(
  schema: ObjectSchema<T>,
  payload: unknown,
  options: ValidatePayloadOptions = {},
): T {
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    allowUnknown: false,
    convert: true,
    stripUnknown: true,
  });

  if (error) {
    throw new BadRequestException({
      message: options.message ?? 'Invalid payload',
      details: error.details.map((detail) => ({
        path: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  return value;
}
