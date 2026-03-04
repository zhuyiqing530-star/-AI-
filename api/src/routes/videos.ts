import { Hono } from 'hono';
import { authMiddleware, type JWTPayload } from '../middleware/auth';
import { createVideoTask, getVideoTask } from '../services/kling';

type Bindings = {
  JWT_SECRET: string;
  KLING_ACCESS_KEY: string;
  KLING_SECRET_KEY: string;
};
type Variables = { jwtPayload: JWTPayload };

export const videosRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

videosRouter.use('/*', authMiddleware);

const ok = <T>(data: T) => ({ code: 0, message: 'ok', data });

// ─── 状态映射 ─────────────────────────────────────────────────
// 可灵状态 → 前端 Video.status
function mapStatus(klingStatus: string): string {
  if (klingStatus === 'succeed') return 'done';
  if (klingStatus === 'failed') return 'failed';
  return 'generating'; // 'submitted' | 'processing'
}

// ─── 前端请求体类型 ────────────────────────────────────────────
interface GenerateRequest {
  productId?: string;
  languages?: string[];
  style?: string;
  duration?: number;   // 秒，前端传整数，转为可灵的 '5' | '10'
  imageUrl?: string;   // 商品图片 URL（可选，有则图生视频；无则纯文生视频）
  imageList?: string[];// 多图（OmniVideo 多图模式，最多 7 张）
  prompt?: string;     // 自定义 prompt，不传则自动生成
}

// ─── 工具：根据配置拼接 prompt ───────────────────────────────
function buildPrompt(config: GenerateRequest): string {
  if (config.prompt) return config.prompt;
  const styleMap: Record<string, string> = {
    professional: '简洁专业，白色背景，产品细节清晰',
    lifestyle: '生活场景，自然光，真实使用情境',
    dramatic: '电影感，暗色调，戏剧性光影',
    minimal: '极简风格，纯色背景，突出产品轮廓',
  };
  const style = styleMap[config.style ?? ''] ?? config.style ?? '简洁专业';
  return `产品展示视频，风格：${style}，展示产品细节和使用场景，专业摄影，高清品质`;
}

// ─── 工具：duration 数字 → 可灵枚举值 ────────────────────────
function toDuration(secs?: number): '5' | '10' {
  return secs && secs >= 8 ? '10' : '5';
}

// ─── POST /api/videos/generate ────────────────────────────────
// ⚠️ 必须在 GET /:id 之前注册（路由顺序保护）
videosRouter.post('/generate', async (c) => {
  const config = await c.req.json<GenerateRequest>();

  try {
    const task = await createVideoTask(
      {
        prompt: buildPrompt(config),
        imageUrl: config.imageUrl,
        imageList: config.imageList,
        duration: toDuration(config.duration),
        aspectRatio: '16:9',
        mode: 'std',
      },
      c.env,
    );

    return c.json(ok({
      id: task.taskId,
      title: `商品视频 ${new Date().toLocaleDateString('zh-CN')}`,
      status: mapStatus(task.status),
      languages: config.languages ?? ['en'],
      thumbnailUrl: 'https://placehold.co/320x180/6366f1/white?text=Generating...',
      videoUrls: [],
      createdAt: new Date().toISOString(),
    }));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '视频生成失败';
    return c.json({ code: 500, message: msg, data: null }, 500);
  }
});

// ─── GET /api/videos/:id/status ──────────────────────────────
// 前端轮询接口，必须在 /:id 之前注册
videosRouter.get('/:id/status', async (c) => {
  const taskId = c.req.param('id');
  try {
    const task = await getVideoTask(taskId, c.env);
    return c.json(ok({
      id: task.taskId,
      status: mapStatus(task.status),
      videoUrls: task.videoUrl ? [task.videoUrl] : [],
      thumbnailUrl: task.thumbnailUrl ?? 'https://placehold.co/320x180/6366f1/white?text=Processing...',
    }));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '状态查询失败';
    return c.json({ code: 500, message: msg, data: null }, 500);
  }
});

// ─── GET /api/videos ─────────────────────────────────────────
// demo 阶段无持久化，返回固定 mock 数据供 Dashboard 展示
videosRouter.get('/', async (c) => {
  return c.json(ok([
    {
      id: 'demo-001',
      title: '蓝牙耳机展示视频（示例）',
      status: 'done',
      languages: ['en', 'ja'],
      thumbnailUrl: 'https://placehold.co/320x180/6366f1/white?text=Demo+1',
      videoUrls: [],
      createdAt: '2026-03-01T10:00:00Z',
    },
  ]));
});

// ─── GET /api/videos/:id ─────────────────────────────────────
// 查询单个视频：demo- 前缀直接返回占位数据；其余视为可灵 task_id
videosRouter.get('/:id', async (c) => {
  const taskId = c.req.param('id');

  // demo 数据不查可灵
  if (taskId.startsWith('demo-')) {
    return c.json(ok({
      id: taskId,
      title: '示例视频',
      status: 'done',
      languages: ['en'],
      thumbnailUrl: 'https://placehold.co/320x180/6366f1/white?text=Demo',
      videoUrls: [],
      createdAt: '2026-03-01T10:00:00Z',
    }));
  }

  try {
    const task = await getVideoTask(taskId, c.env);
    return c.json(ok({
      id: task.taskId,
      title: '商品视频',
      status: mapStatus(task.status),
      languages: [],
      thumbnailUrl: 'https://placehold.co/320x180/6366f1/white?text=Processing...',
      videoUrls: task.videoUrl ? [task.videoUrl] : [],
      createdAt: new Date().toISOString(),
    }));
  } catch {
    return c.json({ code: 404, message: '视频不存在', data: null }, 404);
  }
});
