const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function askGroq(
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number; reasoningEffort?: "low" | "medium" | "high" }
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      // This is a reasoning model — it spends tokens thinking before the
      // visible answer, so max_tokens needs real headroom or the answer
      // gets cut off before any content is written. reasoning_effort caps
      // how much it spends on that hidden reasoning in the first place.
      max_tokens: options?.maxTokens ?? 900,
      temperature: options?.temperature ?? 0.4,
      reasoning_effort: options?.reasoningEffort ?? "medium"
    })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq request failed: ${res.status} ${body.slice(0, 300)}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned an empty response");
  return content;
}
