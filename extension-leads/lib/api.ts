// 后端 API 调用模块 —— SSE 流式消费（复用现有 extension/lib/api.ts 模式）

const API_BASE = "http://localhost:8787";

type OnChunk = (text: string) => void;

// 消费 SSE 流
async function consumeSSE(response: Response, onChunk: OnChunk): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data);
        const text = json?.choices?.[0]?.delta?.content ?? "";
        if (text) onChunk(text);
      } catch {
        // 跳过无法解析的行
      }
    }
  }
}

// 改写/优化 Listing（Tab3 流量优化用）
export async function rewriteListing(
  listing: {
    title: string;
    bulletPoints: string[];
    description: string;
    searchTerms: string;
  },
  marketplace: string,
  language: string,
  onChunk: OnChunk
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/listing/rewrite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listing, marketplace, language }),
  });

  if (!response.ok) {
    throw new Error(`API 错误 ${response.status}`);
  }

  await consumeSSE(response, onChunk);
}

// 关键词建议（Tab3 用）
export async function suggestKeywords(
  title: string,
  category: string,
  marketplace: string,
  onChunk: OnChunk
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/keywords/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, category, marketplace }),
  });

  if (!response.ok) {
    throw new Error(`API 错误 ${response.status}`);
  }

  await consumeSSE(response, onChunk);
}
