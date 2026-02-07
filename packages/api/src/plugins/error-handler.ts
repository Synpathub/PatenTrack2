import { FastifyPluginAsync, FastifyError } from 'fastify';
import fp from 'fastify-plugin';
import { AppError } from '../lib/index';
import { randomUUID } from 'crypto';

const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error: FastifyError | Error, request, reply) => {
    const traceId = (request.headers['x-trace-id'] as string) || randomUUID();

    // Handle AppError subclasses
    if (error instanceof AppError) {
      fastify.log.error({
        err: error,
        traceId,
        url: request.url,
        method: request.method,
      }, `Application error: ${error.message}`);

      return reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          traceId,
          details: error.details || undefined,
        },
      });
    }

    // Handle Fastify validation errors
    if ('validation' in error && error.validation) {
      const validationError = error as FastifyError;
      fastify.log.warn({
        err: error,
        traceId,
        validation: validationError.validation,
        url: request.url,
        method: request.method,
      }, 'Validation error');

      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          traceId,
          details: validationError.validation,
        },
      });
    }

    // Handle Fastify errors with statusCode
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      const fastifyError = error as FastifyError;
      fastify.log.error({
        err: error,
        traceId,
        url: request.url,
        method: request.method,
      }, `Fastify error: ${error.message}`);

      return reply.status(fastifyError.statusCode || 500).send({
        error: {
          code: fastifyError.code || 'INTERNAL_ERROR',
          message: fastifyError.message,
          traceId,
        },
      });
    }

    // Handle unknown errors
    fastify.log.error({
      err: error,
      traceId,
      url: request.url,
      method: request.method,
    }, `Unexpected error: ${error.message}`);

    return reply.status(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        traceId,
      },
    });
  });
};

export default fp(errorHandlerPlugin, {
  name: 'error-handler',
});
