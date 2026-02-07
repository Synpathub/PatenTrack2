import { FastifyPluginAsync } from 'fastify';
import { UserRepository, TenantRepository } from '@patentrack/db';
import { UserRole } from '@patentrack/core';

interface ProfileResponse {
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
  };
  tenant: {
    id: string;
    name: string;
    domain: string;
  };
}

const profileRoutes: FastifyPluginAsync = async (fastify) => {
  const userRepo = new UserRepository();
  const tenantRepo = new TenantRepository();

  // Get authenticated user profile
  fastify.get<{ Reply: ProfileResponse }>('/api/v1/profile', {
    preHandler: fastify.authenticate,
    schema: {
      description: 'Get authenticated user profile',
      tags: ['profile'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                role: { type: 'string' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
            tenant: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                domain: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, _reply) => {
    if (!request.user) {
      throw new Error('User not authenticated');
    }

    // Get user details
    const user = await userRepo.findById(Number(request.user.id));
    if (!user) {
      throw new Error('User not found');
    }

    // Get tenant details
    const tenant = await tenantRepo.findById(user.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    return {
      user: {
        id: String(user.id),
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role as UserRole,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      tenant: {
        id: String(tenant.id),
        name: tenant.name,
        domain: tenant.slug,
      },
    };
  });
};

export default profileRoutes;
