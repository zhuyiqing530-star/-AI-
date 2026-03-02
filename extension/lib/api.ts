const API_BASE = 'http://localhost:8787';

export async function rewriteListing(
  listing: import('shared/types').RewriteRequest,
  onChunk: (text: string) => void,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/listing/rewrite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(listing),
  });
  await consumeSSE(res, onChunk);
}

export async function translateListing(
  listing: import('shared/types').RewriteRequest,
  onChunk: (text: string) => void,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/listing/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(listing),
  });
  await consumeSSE(res, onChunk);
}

/** 消费DeepSeek SSE流 */
async function consumeSSE(res: Response, onChunk: (text: string) => void) {
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);
      if (data === '[DONE]') return;
      try {
        const json = JSON.parse(data);
        const content = json.choices?.[0]?.delta?.content;
        if (content) onChunk(content);
      } catch {}
    }
  }
}
