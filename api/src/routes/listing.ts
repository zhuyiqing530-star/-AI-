import { Hono } from 'hono';
import { streamChat } from '../services/deepseek';
import { buildRewritePrompt } from '../services/prompts';
import type { RewriteRequest } from 'shared/types';

type Bindings = { DEEPSEEK_API_KEY: string };

export const listingRouter = new Hono<{ Bindings: Bindings }>();

listingRouter.post('/rewrite', async (c) => {
  const body = await c.req.json<RewriteRequest>();
  const prompt = buildRewritePrompt(body);
  const stream = await streamChat(
    c.env.DEEPSEEK_API_KEY,
    prompt,
    JSON.stringify(body.listing),
  );
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
});
