import { timingSafeEqual } from 'node:crypto';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';

type InternalRequest = {
  headers: Record<string, string | string[] | undefined>;
};

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.INTERNAL_API_KEY;
    if (!expected) {
      throw new ServiceUnavailableException('Internal API key is not configured.');
    }

    const request = context.switchToHttp().getRequest<InternalRequest>();
    const providedHeader = request.headers['x-internal-api-key'];
    const provided = Array.isArray(providedHeader) ? providedHeader[0] : providedHeader;
    if (
      typeof provided !== 'string' ||
      provided.length !== expected.length ||
      !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
    ) {
      throw new UnauthorizedException('Unauthorized');
    }

    return true;
  }
}
