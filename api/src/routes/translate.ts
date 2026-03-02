import { Hono } from 'hono';
import { streamChat } from '../services/deepseek';
import { buildTranslatePrompt } from '../services/prompts';
import type { RewriteRequest } from 'shared/types';

type Bindings = { DEEPSEEK_API_KEY: string };

export const translateRouter = new Hono<{ Bindings: Bindings }>();

translateRouter.post('/translate', async (c) => {
  const body = await c.req.json<RewriteRequest>();
  const prompt = buildTranslatePrompt(body.language, body.marketplace);
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
