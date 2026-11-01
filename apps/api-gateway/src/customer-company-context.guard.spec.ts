import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import { mock, test } from 'node:test';
import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomerCompanyContextGuard } from '@takumi/common';

const assignedCompanyId = 'eebaa122-bb48-4cb0-9e45-2310ccf7ce28';
const otherCompanyId = 'bd71399c-2a31-4c79-8b10-d19338534902';

type TestRequest = {
  headers: Record<string, string | undefined>;
  query: Record<string, unknown>;
  companyContextId?: string;
};

function executionContext(request: Record<string, unknown>) {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function tokenService(
  companyIds: string[] = [assignedCompanyId],
  tenantId: string | null = 'tenant-id',
) {
  return {
    verifyAsync: mock.fn(async () => ({
      sub: 'user-id',
      principal: { userId: 'user-id', tenantId, companyIds },
    })),
  } as unknown as JwtService;
}

test('a valid principal can use a company assigned in its JWT', async () => {
  const request: TestRequest = {
    headers: {
      authorization: 'Bearer valid-token',
      'x-company-context': assignedCompanyId,
    },
    query: {},
  };
  const guard = new CustomerCompanyContextGuard(tokenService());

  assert.equal(await guard.canActivate(executionContext(request)), true);
  assert.equal(request.companyContextId, assignedCompanyId);
});

test('a tenant user cannot use a company absent from its JWT', async () => {
  const request: TestRequest = {
    headers: {
      authorization: 'Bearer valid-token',
      'x-company-context': otherCompanyId,
    },
    query: {},
  };
  const guard = new CustomerCompanyContextGuard(tokenService());

  await assert.rejects(guard.canActivate(executionContext(request)), ForbiddenException);
});

test('customer routes require an authenticated token and a company context', async () => {
  const noToken = new CustomerCompanyContextGuard(tokenService());
  await assert.rejects(
    noToken.canActivate(executionContext({ headers: {}, query: {} })),
    UnauthorizedException,
  );

  const noCompany = new CustomerCompanyContextGuard(tokenService());
  await assert.rejects(
    noCompany.canActivate(
      executionContext({ headers: { authorization: 'Bearer valid-token' }, query: {} }),
    ),
    BadRequestException,
  );
});

test('root principals can select a company while non-root membership stays enforced', async () => {
  const request: TestRequest = {
    headers: {
      authorization: 'Bearer valid-token',
      'x-company-context': otherCompanyId,
    },
    query: {},
  };
  const guard = new CustomerCompanyContextGuard(tokenService([], null));

  assert.equal(await guard.canActivate(executionContext(request)), true);
  assert.equal(request.companyContextId, otherCompanyId);
});
