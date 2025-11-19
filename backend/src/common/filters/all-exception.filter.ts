import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';

interface ErrorResponse {
    message?: string;
    [key: string]: any;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const errorResponse: ErrorResponse =
            exception instanceof HttpException
                ? (exception.getResponse() as ErrorResponse)
                : { message: exception.message || 'Internal Server Error' };

        const error: ErrorResponse =
            typeof errorResponse === 'string'
                ? { message: errorResponse }
                : errorResponse;

        response.status(status).json({
            success: false,
            status,
            message: error.message ?? 'Something went wrong',
            timestamp: new Date().toISOString(),
            path: ctx.getRequest().url,
        });
    }
}