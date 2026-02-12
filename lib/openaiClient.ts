import OpenAI from "openai";

/**
 * Lazily initialized OpenAI client.
 * The API key is validated at call time (not module load time)
 * to prevent hard 502 crashes in serverless environments.
 */
let openai: OpenAI | null = null;

function getClient(): OpenAI {
  if (openai) return openai;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY environment variable is not set. Add it to .env.local (local) or your hosting provider's environment variables (production)."
    );
  }

  openai = new OpenAI({ apiKey });
  return openai;
}

/**
 * Send a structured chat completion request and parse JSON actions from the response.
 * Uses the flagship model with no token limits for maximum output quality.
 * Includes a 55-second timeout to prevent hanging requests.
 */
export async function chatCompletion(
  systemPrompt: string,
  userPrompt: string
): Promise<unknown> {
  const client = getClient();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55_000);

  try {
    const response = await client.chat.completions.create(
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      },
      { signal: controller.signal }
    );

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from AI service");
    }

    return JSON.parse(content);
  } finally {
    clearTimeout(timeoutId);
  }
}
