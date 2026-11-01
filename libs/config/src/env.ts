import { validateEnvironment } from './validation';

export type NodeEnvironment = 'development' | 'test' | 'production';

export type TakumiConfig = {
  nodeEnv: NodeEnvironment;
  port: number;
  jwtSecret: string;
  corsOrigins: string[];
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
    schema: string;
    ssl: boolean;
    logging: boolean;
    poolMax: number;
  };
  tcp: {
    host: string;
    customersPort: number;
    companiesPort: number;
    dtePort: number;
  };
  http: {
    customersPort: number;
  };
};

export function readAppConfig(source = process.env): TakumiConfig {
  const env = validateEnvironment(source);

  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    jwtSecret: env.JWT_SECRET,
    corsOrigins: readList(env.CORS_ORIGIN),
    database: {
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      name: env.DB_NAME,
      schema: env.DB_SCHEMA,
      ssl: env.DB_SSL,
      logging: env.DB_LOGGING,
      poolMax: env.DB_POOL_MAX,
    },
    tcp: {
      host: env.TCP_HOST,
      customersPort: env.CUSTOMERS_TCP_PORT,
      companiesPort: env.COMPANIES_TCP_PORT,
      dtePort: env.DTE_TCP_PORT,
    },
    http: {
      customersPort: env.CUSTOMERS_HTTP_PORT,
    },
  };
}

function readList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
