import {
  GatewayTimeoutException,
  HttpException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, timeout } from 'rxjs';

export async function sendRpc<T>(
  client: ClientProxy,
  pattern: string,
  payload: unknown,
  timeoutMs = 8000,
): Promise<T> {
  return firstValueFrom(
    client.send<T>(pattern, payload).pipe(
      timeout(timeoutMs),
      catchError((error) => {
        if (error?.name === 'TimeoutError') {
          throw new GatewayTimeoutException('Upstream service timeout');
        }

        if (error instanceof HttpException) {
          throw error;
        }

        const statusCode = error?.statusCode ?? error?.response?.statusCode ?? error?.status;

        if (typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500) {
          throw new HttpException(error?.response ?? error, statusCode);
        }

        throw new ServiceUnavailableException(error?.message ?? 'Upstream service unavailable');
      }),
    ),
  );
}
