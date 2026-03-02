import { Hono } from 'hono';
import { streamChat } from '../services/deepseek';

type Bindings = { DEEPSEEK_API_KEY: string };

export const keywordsRouter = new Hono<{ Bindings: Bindings }>();

keywordsRouter.post('/suggest', async (c) => {
  const { title, category, marketplace } = await c.req.json();
  const prompt = `You are an Amazon keyword research expert. Given a product title and category, suggest high-conversion keywords.
Output JSON: { "keywords": ["top 10 primary keywords"], "longTail": ["top 10 long-tail phrases"] }`;
  const userMsg = `Title: ${title}\nCategory: ${category}\nMarketplace: ${marketplace}`;

  const stream = await streamChat(c.env.DEEPSEEK_API_KEY, prompt, userMsg);
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
});
