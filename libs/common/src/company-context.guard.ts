import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type TokenPrincipal = {
  userId: string;
  tenantId: string | null;
  companyIds: string[];
};

type AccessTokenPayload = {
  sub: string;
  principal?: TokenPrincipal;
};

type CustomerRequest = {
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, unknown>;
  companyContextId?: string;
};

@Injectable()
export class CustomerCompanyContextGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<CustomerRequest>();
    const authorization = request.headers.authorization;
    if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Unauthorized');
    }

    let payload: AccessTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        authorization.slice('Bearer '.length),
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const principal = payload.principal;
    if (!payload.sub || !principal?.userId || !Array.isArray(principal.companyIds)) {
      throw new UnauthorizedException('Token needs refresh');
    }

    const headerCompanyId = this.firstString(request.headers['x-company-context']);
    const queryCompanyId = this.firstString(request.query.companyId);
    if (headerCompanyId && queryCompanyId && headerCompanyId !== queryCompanyId) {
      throw new BadRequestException('companyId debe coincidir con X-Company-Context.');
    }

    const companyId = headerCompanyId ?? queryCompanyId;
    if (!companyId) {
      throw new BadRequestException('Se requiere X-Company-Context para acceder a clientes.');
    }

    if (principal.tenantId !== null && !principal.companyIds.includes(companyId)) {
      throw new ForbiddenException('La empresa seleccionada no está asignada al usuario.');
    }

    request.companyContextId = companyId;
    return true;
  }

  private firstString(value: unknown): string | undefined {
    const candidate = Array.isArray(value) ? value[0] : value;
    return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : undefined;
  }
}
