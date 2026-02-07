import { describe, it, expect } from 'vitest';
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  ConflictError,
  TenantIsolationError,
} from '../src/errors';

describe('Error Classes', () => {
  it('should create AppError with correct properties', () => {
    const error = new AppError(500, 'TEST_ERROR', 'Test message');
    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('Test message');
    expect(error.name).toBe('AppError');
  });

  it('should create NotFoundError with default message', () => {
    const error = new NotFoundError();
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Resource not found');
  });

  it('should create NotFoundError with custom message', () => {
    const error = new NotFoundError('User not found');
    expect(error.message).toBe('User not found');
  });

  it('should create UnauthorizedError', () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('should create ForbiddenError', () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });

  it('should create ValidationError with details', () => {
    const details = { email: ['Invalid email format'], password: ['Too short'] };
    const error = new ValidationError('Validation failed', details);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toEqual(details);
  });

  it('should create ConflictError', () => {
    const error = new ConflictError();
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('CONFLICT');
  });

  it('should create TenantIsolationError', () => {
    const error = new TenantIsolationError();
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('TENANT_ISOLATION_VIOLATION');
    expect(error.message).toBe('Access denied: tenant isolation violation');
  });
});
