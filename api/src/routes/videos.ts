import { Hono } from 'hono';
import { authMiddleware, type JWTPayload } from '../middleware/auth';

type Bindings = { JWT_SECRET: string };
type Variables = { jwtPayload: JWTPayload };

export const videosRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

videosRouter.use('/*', authMiddleware);

const ok = <T>(data: T) => ({ code: 0, message: 'ok', data });

// mock 数据（内存常量，demo 用）
const MOCK_VIDEOS = [
  {
    id: 'vid-001',
    title: '蓝牙耳机展示视频',
    status: 'done',
    languages: ['en', 'ja'],
    thumbnailUrl: 'https://placehold.co/320x180/6366f1/white?text=Video+1',
    videoUrls: ['https://example.com/video1-en.mp4', 'https://example.com/video1-ja.mp4'],
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'vid-002',
    title: '瑜伽裤种草视频',
    status: 'generating',
    languages: ['en', 'ja', 'ko', 'es', 'fr'],
    thumbnailUrl: 'https://placehold.co/320x180/ec4899/white?text=Video+2',
    videoUrls: [],
    createdAt: '2026-03-02T14:30:00Z',
  },
];

// ⚠️ 路由顺序关键：/generate 必须在 /:id 之前注册
// 否则 POST /generate 会被 /:id 捕获，id 变成字符串 "generate"

// POST /api/videos/generate
videosRouter.post('/generate', async (c) => {
  const config = await c.req.json();
  // mock：返回"生成中"状态；可灵 API 接入后在此替换
  const newVideo = {
    id: `vid-${Date.now()}`,
    title: `商品视频 ${new Date().toLocaleDateString('zh-CN')}`,
    status: 'generating',
    languages: config.languages || ['en'],
    thumbnailUrl: 'https://placehold.co/320x180/6366f1/white?text=Generating...',
    videoUrls: [],
    createdAt: new Date().toISOString(),
  };
  return c.json(ok(newVideo));
});

// GET /api/videos
videosRouter.get('/', async (c) => {
  return c.json(ok(MOCK_VIDEOS));
});

// GET /api/videos/:id
videosRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const video = MOCK_VIDEOS.find((v) => v.id === id);
  if (!video) {
    return c.json({ code: 404, message: '视频不存在', data: null }, 404);
  }
  return c.json(ok(video));
});
