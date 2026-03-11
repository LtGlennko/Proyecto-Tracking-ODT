import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

export interface Response<T> {
  success: boolean;
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const requestId = uuidv4();
    return next.handle().pipe(
      map((data) => {
        const meta: any = { timestamp: new Date().toISOString(), requestId };
        if (data && data._pagination) {
          const { items, total, page, limit } = data._pagination;
          meta.total = total;
          meta.page = page;
          meta.limit = limit;
          meta.totalPages = Math.ceil(total / limit);
          return { success: true, data: items, meta };
        }
        return { success: true, data, meta };
      }),
    );
  }
}
