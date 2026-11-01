import { ValueTransformer } from 'typeorm';

export const decimalNumberTransformer: ValueTransformer = {
  to(value?: number | null): number | null {
    return value ?? null;
  },
  from(value?: string | number | null): number | null {
    if (value === undefined || value === null) {
      return null;
    }

    return Number(value);
  },
};
