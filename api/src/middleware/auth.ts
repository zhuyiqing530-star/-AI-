// Cloudflare Workers 原生 crypto.subtle 实现 HMAC-SHA256 JWT，零第三方依赖

import type { Context, Next } from 'hono';

export type JWTPayload = {
  sub: string;
  name: string;
  email: string;
  plan: string;
  iat: number;
  exp: number;
};

type Bindings = { JWT_SECRET: string };
type Variables = { jwtPayload: JWTPayload };

// ---- Base64URL 工具 ----

function base64url(input: Uint8Array): string {
  return btoa(String.fromCharCode(...input))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64urlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '==='.slice((padded.length + 3) % 4);
  const raw = atob(padded + padding);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

// ---- HMAC-SHA256 Key ----

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

// ---- JWT Sign / Verify ----

export async function signJWT(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  secret: string,
): Promise<string> {
  const header = base64url(
    new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })),
  );
  const now = Math.floor(Date.now() / 1000);
  const body = base64url(
    new TextEncoder().encode(
      JSON.stringify({ ...payload, iat: now, exp: now + 86400 * 7 }),
    ),
  );
  const key = await getKey(secret);
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${header}.${body}`),
  );
  return `${header}.${body}.${base64url(new Uint8Array(sig))}`;
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');
  const [header, body, sig] = parts;
  const key = await getKey(secret);
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    base64urlDecode(sig),
    new TextEncoder().encode(`${header}.${body}`),
  );
  if (!valid) throw new Error('Invalid token signature');
  const payload: JWTPayload = JSON.parse(
    new TextDecoder().decode(base64urlDecode(body)),
  );
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
  return payload;
}

// ---- Hono 认证中间件 ----

export async function authMiddleware(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next,
) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ code: 401, message: '未授权，请先登录', data: null }, 401);
  }
  try {
    const token = authHeader.slice(7);
    const payload = await verifyJWT(token, c.env.JWT_SECRET);
    c.set('jwtPayload', payload);
    await next();
  } catch {
    return c.json({ code: 401, message: '登录已过期，请重新登录', data: null }, 401);
  }
}
