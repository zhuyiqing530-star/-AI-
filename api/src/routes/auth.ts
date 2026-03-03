import { Hono } from 'hono';
import { signJWT } from '../middleware/auth';

type Bindings = { JWT_SECRET: string };

export const authRouter = new Hono<{ Bindings: Bindings }>();

const ok = <T>(data: T) => ({ code: 0, message: 'ok', data });
const fail = (message: string, code = 400) => ({ code, message, data: null });

// POST /api/auth/register
authRouter.post('/register', async (c) => {
  const body = await c.req.json<{ name: string; email: string; password: string }>();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return c.json(fail('请填写所有字段'), 400);
  }
  if (password.length < 8) {
    return c.json(fail('密码至少8位'), 400);
  }

  // demo 模式：userId 由 email 派生，不存库
  const userId = btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
  const user = {
    id: userId,
    name,
    email,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    plan: 'free',
    createdAt: new Date().toISOString(),
  };

  const token = await signJWT(
    { sub: userId, name, email, plan: 'free' },
    c.env.JWT_SECRET,
  );

  return c.json(ok({ token, user }));
});

// POST /api/auth/login
authRouter.post('/login', async (c) => {
  const body = await c.req.json<{ email: string; password: string }>();
  const { email, password } = body;

  if (!email || !password) {
    return c.json(fail('请填写邮箱和密码'), 400);
  }
  // demo 模式：密码 >= 8 位即可登录（生产环境需查库验哈希）
  if (password.length < 8) {
    return c.json(fail('邮箱或密码错误'), 401);
  }

  const userId = btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
  const name = email.split('@')[0];
  const user = {
    id: userId,
    name,
    email,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    plan: 'free',
    createdAt: new Date().toISOString(),
  };

  const token = await signJWT(
    { sub: userId, name, email, plan: 'free' },
    c.env.JWT_SECRET,
  );

  return c.json(ok({ token, user }));
});
