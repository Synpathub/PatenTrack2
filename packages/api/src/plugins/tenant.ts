import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { setTenantContext } from '@patentrack/db';

declare module 'fastify' {
  interface FastifyRequest {
    tenantId?: string;
  }
}

const tenantPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', async (request: FastifyRequest, _reply: FastifyReply) => {
    // Extract tenantId from JWT if available
    if (request.user && typeof request.user === 'object' && 'tenantId' in request.user) {
      const tenantId = request.user.tenantId as string;
      request.tenantId = tenantId;
      setTenantContext(Number(tenantId));
    }
  });

  // Clear tenant context after request
  fastify.addHook('onResponse', async (_request: FastifyRequest, _reply: FastifyReply) => {
    setTenantContext(0);
  });
};

export default fp(tenantPlugin, {
  name: 'tenant',
  dependencies: ['auth'],
});
