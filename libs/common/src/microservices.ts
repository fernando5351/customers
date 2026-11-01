import { Transport } from '@nestjs/microservices';

export const SERVICE_NAMES = {
  CUSTOMERS: 'CUSTOMERS_SERVICE',
  COMPANIES: 'COMPANIES_SERVICE',
  DTE: 'DTE_SERVICE',
} as const;

export const MESSAGE_PATTERNS = {
  customers: {
    health: 'customers.health',
    create: 'customers.create',
    update: 'customers.update',
    findById: 'customers.findById',
    list: 'customers.list',
    taxRoles: {
      create: 'customers.taxRoles.create',
      update: 'customers.taxRoles.update',
      findById: 'customers.taxRoles.findById',
      list: 'customers.taxRoles.list',
    },
  },
} as const;

export function tcpMicroserviceOptions(host: string, port: number) {
  return {
    transport: Transport.TCP,
    options: { host, port },
  } as const;
}

export function tcpClientOptions(host: string, port: number) {
  return {
    transport: Transport.TCP,
    options: { host, port },
  } as const;
}
