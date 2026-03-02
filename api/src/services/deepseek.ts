/** DeepSeek API客户端 — OpenAI兼容格式 */

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

export async function streamChat(
  apiKey: string,
  systemPrompt: string,
  userContent: string,
): Promise<ReadableStream> {
  const res = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      stream: true,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API error ${res.status}: ${err}`);
  }

  return res.body!;
}
