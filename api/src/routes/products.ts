import { Hono } from 'hono';
import { authMiddleware, type JWTPayload } from '../middleware/auth';

type Bindings = { JWT_SECRET: string };
type Variables = { jwtPayload: JWTPayload };

export const productsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

productsRouter.use('/*', authMiddleware);

const ok = <T>(data: T) => ({ code: 0, message: 'ok', data });

// POST /api/products
productsRouter.post('/', async (c) => {
  const body = await c.req.json();
  const payload = c.get('jwtPayload');

  const product = {
    id: crypto.randomUUID(),
    name: body.name || '未命名商品',
    description: body.description || '',
    imageUrls: body.imageUrls || [],
    sourceUrl: body.sourceUrl || '',
    platform: body.platform || 'amazon',
    userId: payload.sub,
    createdAt: new Date().toISOString(),
  };

  return c.json(ok(product));
});
