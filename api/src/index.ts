import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { listingRouter } from './routes/listing';
import { translateRouter } from './routes/translate';
import { keywordsRouter } from './routes/keywords';

type Bindings = {
  DEEPSEEK_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/*', cors({ origin: '*' }));

app.route('/api/listing', listingRouter);
app.route('/api/listing', translateRouter);
app.route('/api/keywords', keywordsRouter);

app.get('/', (c) => c.json({ status: 'ok', service: 'listing-optimizer-api' }));

export default app;
