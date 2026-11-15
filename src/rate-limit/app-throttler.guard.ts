import { Injectable } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { GqlContextType } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';

interface RequestResponse {
  req: Request;
  res: Response;
}

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected getRequestResponse(context: ExecutionContext): RequestResponse {
    if (context.getType<GqlContextType>() === 'graphql') {
      return GqlExecutionContext.create(context).getContext<RequestResponse>();
    }

    const http = context.switchToHttp();

    return {
      req: http.getRequest<Request>(),
      res: http.getResponse<Response>(),
    };
  }
}
