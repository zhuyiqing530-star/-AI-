import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { listingRouter } from './routes/listing';
import { translateRouter } from './routes/translate';
import { keywordsRouter } from './routes/keywords';
import { authRouter } from './routes/auth';
import { userRouter } from './routes/user';
import { productsRouter } from './routes/products';
import { videosRouter } from './routes/videos';

type Bindings = {
  DEEPSEEK_API_KEY: string;
  JWT_SECRET: string;
  KLING_ACCESS_KEY: string;
  KLING_SECRET_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/*', cors({ origin: '*' }));

// 原有路由（不改）
app.route('/api/listing', listingRouter);
app.route('/api/listing', translateRouter);
app.route('/api/keywords', keywordsRouter);

// 新增路由
app.route('/api/auth', authRouter);
app.route('/api/user', userRouter);
app.route('/api/products', productsRouter);
app.route('/api/videos', videosRouter);

app.get('/', (c) => c.json({ status: 'ok', service: 'cross-border-ai-api' }));

export default app;
