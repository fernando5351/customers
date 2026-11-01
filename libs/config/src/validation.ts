import * as Joi from 'joi';

export const environmentValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(3000),
  CORS_ORIGIN: Joi.string().allow('').default(''),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SCHEMA: Joi.string().default('public'),
  DB_SSL: Joi.boolean().truthy('true').truthy('1').falsy('false').falsy('0').default(false),
  DB_LOGGING: Joi.boolean()
    .truthy('true')
    .truthy('1')
    .falsy('false')
    .falsy('0')
    .default(false),
  DB_POOL_MAX: Joi.number().integer().min(1).max(100).default(2),

  TCP_HOST: Joi.string().default('127.0.0.1'),
  CUSTOMERS_TCP_PORT: Joi.number().port().default(3101),
  COMPANIES_TCP_PORT: Joi.number().port().default(3102),
  DTE_TCP_PORT: Joi.number().port().default(3103),

  CUSTOMERS_HTTP_PORT: Joi.number().port().default(3201),
});

export type ValidatedEnvironment = {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  CORS_ORIGIN: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_SCHEMA: string;
  DB_SSL: boolean;
  DB_LOGGING: boolean;
  DB_POOL_MAX: number;
  TCP_HOST: string;
  CUSTOMERS_TCP_PORT: number;
  COMPANIES_TCP_PORT: number;
  DTE_TCP_PORT: number;
  CUSTOMERS_HTTP_PORT: number;
};

export function validateEnvironment(source: NodeJS.ProcessEnv): ValidatedEnvironment {
  const { error, value } = environmentValidationSchema.validate(source, {
    abortEarly: false,
    allowUnknown: true,
    convert: true,
  });

  if (error) {
    throw new Error(`Invalid environment configuration: ${error.message}`);
  }

  return value as ValidatedEnvironment;
}
