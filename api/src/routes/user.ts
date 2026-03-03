import { Hono } from 'hono';
import { authMiddleware, type JWTPayload } from '../middleware/auth';

type Bindings = { JWT_SECRET: string };
type Variables = { jwtPayload: JWTPayload };

export const userRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

userRouter.use('/*', authMiddleware);

const ok = <T>(data: T) => ({ code: 0, message: 'ok', data });

// GET /api/user/profile
userRouter.get('/profile', async (c) => {
  const payload = c.get('jwtPayload');
  const user = {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(payload.name)}`,
    plan: payload.plan,
    createdAt: new Date(payload.iat * 1000).toISOString(),
  };
  return c.json(ok(user));
});
