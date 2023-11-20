import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Prisma } from "@prisma/client";
import { Response } from "express";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    console.error("prisma client Error", exception.message);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\"/g, "");

    if (exception.code === "P2002") {
      const status = HttpStatus.CONFLICT;
      response.status(status).json({
        statusCode: status,
        message,
      });
    } else {
      super.catch(exception, host); // 기본 500 error 처리
    }
  }
}
