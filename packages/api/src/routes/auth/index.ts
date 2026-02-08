import { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcrypt';
import { UserRepository } from '@patentrack/db';
import { UnauthorizedError, ValidationError } from '../../lib';
import { UserRole, User } from '@patentrack/core';

// Extended user type that includes password hash from database
interface UserWithPassword extends User {
  passwordHash: string;
}

interface SignInBody {
  username: string;
  password: string;
}

interface VerifyCodeBody {
  username: string;
  code: string;
}

interface AdminSignInBody {
  username: string;
  password: string;
}

// In-memory store for verification codes
const verificationCodes = new Map<string, { code: string; expiresAt: number; userId: string; tenantId: string; role: UserRole }>();

// Cleanup expired codes periodically
setInterval(() => {
  const now = Date.now();
  for (const [username, data] of verificationCodes.entries()) {
    if (data.expiresAt < now) {
      verificationCodes.delete(username);
    }
  }
}, 60000); // Clean up every minute

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const userRepo = new UserRepository();

  // Customer sign-in (step 1: request verification code)
  fastify.post<{ Body: SignInBody }>('/api/v1/auth/signin', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
      },
    },
    schema: {
      description: 'Customer sign-in - request verification code',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, _reply) => {
    const { username, password } = request.body;

    if (!username || !password) {
      throw new ValidationError('Username and password are required');
    }

    // Find user by username
    const user = await userRepo.findByUsername(username) as UserWithPassword | null;
    if (!user) {
      throw new UnauthorizedError('Invalid username or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid username or password');
    }

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code with 5-minute expiry
    verificationCodes.set(username, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
      userId: String(user.id),
      tenantId: String(user.tenantId),
      role: user.role as UserRole,
    });

    // In production, send code via email/SMS
    fastify.log.info({ username, code }, 'Verification code generated');

    return {
      success: true,
      message: 'Verification code sent. Please check your email.',
    };
  });

  // Verify code (step 2: verify code and issue JWT)
  fastify.post<{ Body: VerifyCodeBody }>('/api/v1/auth/verify-code', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
      },
    },
    schema: {
      description: 'Verify code and issue JWT token',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['username', 'code'],
        properties: {
          username: { type: 'string' },
          code: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            token: { type: 'string' },
            user: { type: 'object' },
          },
        },
      },
    },
  }, async (request, _reply) => {
    const { username, code } = request.body;

    if (!username || !code) {
      throw new ValidationError('Username and code are required');
    }

    // Check stored code
    const storedData = verificationCodes.get(username);
    if (!storedData) {
      throw new UnauthorizedError('Invalid or expired verification code');
    }

    // Check expiry
    if (storedData.expiresAt < Date.now()) {
      verificationCodes.delete(username);
      throw new UnauthorizedError('Verification code has expired');
    }

    // Verify code
    if (storedData.code !== code) {
      throw new UnauthorizedError('Invalid verification code');
    }

    // Get user details
    const user = await userRepo.findById(Number(storedData.userId));
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Issue JWT
    const token = fastify.jwt.sign({
      id: String(user.id),
      tenantId: String(user.tenantId),
      role: user.role,
    });

    // Clear verification code
    verificationCodes.delete(username);

    return {
      success: true,
      token,
      user: {
        id: String(user.id),
        username: user.username,
        email: user.email,
        role: user.role as UserRole,
        tenantId: String(user.tenantId),
      },
    };
  });

  // Admin sign-in (no verification code required)
  fastify.post<{ Body: AdminSignInBody }>('/api/v1/auth/signin/admin', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
      },
    },
    schema: {
      description: 'Admin sign-in - direct JWT issuance',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            token: { type: 'string' },
            user: { type: 'object' },
          },
        },
      },
    },
  }, async (request, _reply) => {
    const { username, password } = request.body;

    if (!username || !password) {
      throw new ValidationError('Username and password are required');
    }

    // Find user by username with super_admin role
    const user = await userRepo.findByUsername(username) as UserWithPassword | null;
    if (!user || user.role !== UserRole.SUPER_ADMIN) {
      throw new UnauthorizedError('Invalid admin credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid admin credentials');
    }

    // Issue JWT immediately (no verification code for admins)
    const token = fastify.jwt.sign({
      id: String(user.id),
      tenantId: String(user.tenantId),
      role: user.role,
    });

    return {
      success: true,
      token,
      user: {
        id: String(user.id),
        username: user.username,
        email: user.email,
        role: user.role as UserRole,
      },
    };
  });

  // Share link authentication (placeholder)
  fastify.get<{
    Params: {
      code: string;
      type: string;
    };
  }>('/api/v1/auth/authenticate/:code/:type', {
    schema: {
      description: 'Share link authentication (not implemented)',
      tags: ['auth'],
      params: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          type: { type: 'string' },
        },
      },
    },
  }, async (_request, reply) => {
    reply.status(501);
    return {
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Share link authentication not yet implemented',
      },
    };
  });
};

export default authRoutes;
