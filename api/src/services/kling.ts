/**
 * 可灵 OmniVideo API 服务
 * 文档：https://app.klingai.com/cn/dev/document-api/apiReference/model/OmniVideo
 *
 * 认证：HMAC-SHA256 JWT（Workers 原生 crypto.subtle，零依赖）
 * JWT Payload：{ iss: AccessKey, exp: now+1800, nbf: now-5 }
 */

const KLING_BASE = 'https://api.klingai.com';

// ─── JWT 工具 ────────────────────────────────────────────────

function b64url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generateKlingJWT(accessKey: string, secretKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header  = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({
    iss: accessKey,  // 可灵要求：iss 填 AccessKey
    exp: now + 1800, // 30 分钟有效期
    nbf: now - 5,    // 提前 5 秒生效，防时钟偏差
  }));

  const sigInput = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(sigInput));

  // ArrayBuffer → base64url（逐字节拼接避免大数组 spread 溢出）
  let binary = '';
  new Uint8Array(sigBytes).forEach((b) => (binary += String.fromCharCode(b)));
  const sig = b64url(binary);

  return `${sigInput}.${sig}`;
}

// ─── 通用请求封装 ─────────────────────────────────────────────

type KlingEnv = { KLING_ACCESS_KEY: string; KLING_SECRET_KEY: string };

async function klingFetch<T>(
  method: 'GET' | 'POST',
  path: string,
  env: KlingEnv,
  body?: object,
): Promise<T> {
  const token = await generateKlingJWT(env.KLING_ACCESS_KEY, env.KLING_SECRET_KEY);

  const res = await fetch(`${KLING_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Keling API ${res.status}: ${text}`);
  }

  const json = await res.json() as { code: number; message: string; data: T };
  if (json.code !== 0) {
    throw new Error(`Keling 业务错误 ${json.code}: ${json.message}`);
  }

  return json.data;
}

// ─── 类型定义 ─────────────────────────────────────────────────

export interface KlingCreateParams {
  prompt: string;
  imageUrl?: string;       // 单张图片 URL（图生视频）
  imageList?: string[];    // 多图 URL（OmniVideo 多图模式，最多 7 张）
  duration?: '5' | '10';
  aspectRatio?: '16:9' | '9:16' | '1:1';
  mode?: 'std' | 'pro';
  negativePrompt?: string;
}

export interface KlingTaskResult {
  taskId: string;
  status: 'submitted' | 'processing' | 'succeed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  statusMsg?: string;
}

// ─── 创建视频任务（OmniVideo: model_name = kling-video-o1）────

interface CreateResponseData {
  task_id: string;
  task_status: string;
  task_status_msg?: string;
}

export async function createVideoTask(
  params: KlingCreateParams,
  env: KlingEnv,
): Promise<KlingTaskResult> {
  const body: Record<string, unknown> = {
    model_name: 'kling-video-o1',
    prompt: params.prompt,
    duration: params.duration ?? '5',
    aspect_ratio: params.aspectRatio ?? '16:9',
    mode: params.mode ?? 'std',
    ...(params.negativePrompt ? { negative_prompt: params.negativePrompt } : {}),
  };

  // 图片参数：单图 or 多图
  if (params.imageList && params.imageList.length > 0) {
    body.image_list = params.imageList;
  } else if (params.imageUrl) {
    body.image = params.imageUrl;
  }

  const data = await klingFetch<CreateResponseData>(
    'POST',
    '/v1/videos/image2video',
    env,
    body,
  );

  return {
    taskId: data.task_id,
    status: data.task_status as KlingTaskResult['status'],
    statusMsg: data.task_status_msg,
  };
}

// ─── 查询任务状态 ─────────────────────────────────────────────

interface QueryResponseData {
  task_id: string;
  task_status: string;
  task_status_msg?: string;
  task_result?: {
    videos?: Array<{ id: string; url: string; duration: string }>;
  };
}

export async function getVideoTask(
  taskId: string,
  env: KlingEnv,
): Promise<KlingTaskResult> {
  const data = await klingFetch<QueryResponseData>(
    'GET',
    `/v1/videos/image2video/${taskId}`,
    env,
  );

  const result: KlingTaskResult = {
    taskId: data.task_id,
    status: data.task_status as KlingTaskResult['status'],
    statusMsg: data.task_status_msg,
  };

  if (data.task_status === 'succeed' && data.task_result?.videos?.[0]) {
    result.videoUrl = data.task_result.videos[0].url;
    // 可灵不提供独立封面图 URL，前端用 <video> 标签自动截帧即可
  }

  return result;
}
